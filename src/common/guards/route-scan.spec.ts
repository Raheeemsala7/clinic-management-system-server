import { Test } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { DiscoveryService, DiscoveryModule, MetadataScanner } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Route Scan Test
 *
 * Ensures every route handler in the application either:
 *  - Has @Roles(...) decorator (access controlled), OR
 *  - Has @Public() decorator (intentionally public)
 *
 * A route without either is a security hole — this test blocks such routes.
 */
describe('Route scan: every route must have @Roles or @Public', () => {
  let discoveryService: DiscoveryService;
  let metadataScanner: MetadataScanner;
  let reflector: Reflector;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [DiscoveryModule],
      providers: [MetadataScanner],
    }).compile();

    discoveryService = module.get(DiscoveryService);
    metadataScanner = module.get(MetadataScanner);
    reflector = module.get(Reflector);
  });

  it('all controller methods have @Roles or @Public', () => {
    const controllers = discoveryService.getControllers();
    const violations: string[] = [];

    for (const wrapper of controllers) {
      const { instance } = wrapper;
      if (!instance) continue;

      const proto = Object.getPrototypeOf(instance);
      const methods = metadataScanner.getAllMethodNames(proto);

      for (const methodName of methods) {
        const handler = proto[methodName];
        if (!handler || typeof handler !== 'function') continue;

        // Check for HTTP method decorators (GET, POST, etc.)
        const httpMethod = Reflect.getMetadata('method', handler);
        if (httpMethod === undefined) continue; // not a route handler

        const isPublic = Reflect.getMetadata(IS_PUBLIC_KEY, handler);
        const roles = Reflect.getMetadata(ROLES_KEY, handler);

        if (!isPublic && (!roles || roles.length === 0)) {
          violations.push(`${proto.constructor.name}.${methodName}`);
        }
      }
    }

    if (violations.length > 0) {
      fail(
        `The following routes have neither @Roles nor @Public:\n${violations
          .map((v) => `  - ${v}`)
          .join('\n')}`,
      );
    }

    expect(violations).toHaveLength(0);
  });
});

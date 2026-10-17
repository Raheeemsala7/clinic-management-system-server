import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import patientsRoutes from './patients.routes';
import appointmentsRoutes from './appointments.routes';
import queueRoutes from './queue.routes';
import visitsRoutes from './visits.routes';
import prescriptionsRoutes from './prescriptions.routes';
import drugsRoutes from './drugs.routes';
import attachmentsRoutes from './attachments.routes';
import paymentsRoutes from './payments.routes';
import expensesRoutes from './expenses.routes';
import closingRoutes from './closing.routes';
import reportsRoutes from './reports.routes';
import settingsRoutes from './settings.routes';
import auditRoutes from './audit.routes';
import doctorScheduleRoutes from './doctor-schedule.routes';

const apiRouter = Router();

// Resource routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/patients', patientsRoutes);
apiRouter.use('/appointments', appointmentsRoutes);
apiRouter.use('/doctor-schedule', doctorScheduleRoutes);
apiRouter.use('/visits', visitsRoutes);
apiRouter.use('/drugs', drugsRoutes);
apiRouter.use('/attachments', attachmentsRoutes);
apiRouter.use('/closing', closingRoutes);
apiRouter.use('/reports', reportsRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/audit-logs', auditRoutes);

// Contextual & nested routers (queue, prescriptions, payments, expenses)
apiRouter.use(queueRoutes);
apiRouter.use(prescriptionsRoutes);
apiRouter.use(paymentsRoutes);
apiRouter.use(expensesRoutes);

export default apiRouter;

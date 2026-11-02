declare type MetadataData = {
  page: string;
  limit: string;
  total: string;
  totalPages: string;
};

declare type SuccessResponse<T> = {
  status: true;
  code: number;
  message?: string;
  payload: T;
  metadata?: MetadataData;
};

declare type IErrorResponse = {
  status: false;
  code: number;
  message?: string;
  errors?: Array<{
    path: string;
    message: string;
  }>;
};

declare type ApiResponse<T> = SuccessResponse<T> | IErrorResponse;

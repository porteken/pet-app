import React, { memo, useMemo } from "react";

import { DatabaseError } from "@/features/database-error";

import { ERROR_MESSAGES, ERROR_TITLES } from "../constants";

interface ErrorHandlerProperties {
  error: Error;
}

export const LocationErrorHandler = memo<ErrorHandlerProperties>(
  ({ error }) => {
    // Memoize the error type check to avoid unnecessary recalculations
    const errorConfig = useMemo(() => {
      const isNoDataError = error.message === ERROR_MESSAGES.NO_DATA;

      return {
        message: isNoDataError
          ? ERROR_MESSAGES.NO_DATA_UI
          : ERROR_MESSAGES.DATABASE_CONNECTION,
        title: isNoDataError
          ? ERROR_TITLES.NO_DATA
          : ERROR_TITLES.DATABASE_CONNECTION,
      };
    }, [error.message]);

    return (
      <DatabaseError message={errorConfig.message} title={errorConfig.title} />
    );
  }
);

LocationErrorHandler.displayName = "LocationErrorHandler";

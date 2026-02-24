type MockSupabaseQuery = {
  eq: (...arguments_: unknown[]) => MockSupabaseQuery;
  gt: (...arguments_: unknown[]) => MockSupabaseQuery;
  gte: (...arguments_: unknown[]) => MockSupabaseQuery;
  limit: (...arguments_: unknown[]) => MockSupabaseQuery;
  lt: (...arguments_: unknown[]) => MockSupabaseQuery;
  lte: (...arguments_: unknown[]) => MockSupabaseQuery;
  maybeSingle: (...arguments_: unknown[]) => unknown;
  order: (...arguments_: unknown[]) => MockSupabaseQuery;
  select: (...arguments_: unknown[]) => MockSupabaseQuery;
  single: (...arguments_: unknown[]) => unknown;
};

const createNoopFunction = <TArguments extends unknown[], TReturn>(
  implementation: (...arguments_: TArguments) => TReturn
) => implementation;

const createMockSupabaseQuery = (): MockSupabaseQuery => {
  const query = {} as MockSupabaseQuery;

  query.eq = createNoopFunction(() => query);
  query.gt = createNoopFunction(() => query);
  query.gte = createNoopFunction(() => query);
  query.limit = createNoopFunction(() => query);
  query.lt = createNoopFunction(() => query);
  query.lte = createNoopFunction(() => query);
  query.maybeSingle = createNoopFunction(() => {});
  query.order = createNoopFunction(() => query);
  query.select = createNoopFunction(() => query);
  query.single = createNoopFunction(() => {});

  return query;
};

export const createRuntimeMockSupabaseClient = () => ({
  from: createNoopFunction((_table: string) => createMockSupabaseQuery()),
  rpc: createNoopFunction(() => createMockSupabaseQuery()),
});

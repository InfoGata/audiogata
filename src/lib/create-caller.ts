// Vendored replacement for the abandoned `react-outside-call` package, whose
// only published version mis-declares `eslint` as a runtime dependency and
// pulls in a vulnerable js-yaml. The shipped code is this trivial helper.

export type Default = {
  [key: string]: any;
};

type CallerObj<T extends Default> = {
  [Property in keyof T]?: ReturnType<T[Property]>;
};

export type OutsideConfig<Type extends Default> = {
  call: CallerObj<Type>;
  initCaller: CallerObj<Type>;
};

export function createCaller<T extends Default>(
  initCaller: T
): OutsideConfig<T> {
  return {
    initCaller,
    call: {},
  };
}

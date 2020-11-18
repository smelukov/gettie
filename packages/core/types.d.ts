declare type Branch = string[];

declare type Coverage<T> = {
  branches: {
    all: Branch[],
    used: Branch[],
    unused: Branch[],
  },
  data: {
    all: T,
    used: any,
    unused: any,
  }
};

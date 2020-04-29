const timeoutPromise: (time: number) => Promise<void> = (time: number) => {
  return new Promise(resolve =>
    setTimeout(() => {
      resolve();
    }, time)
  );
};

export default timeoutPromise;

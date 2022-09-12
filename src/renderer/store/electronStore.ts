export default () => {
  const { store } = window.electron;

  return {
    getItem: (key: string) => {
      return new Promise((resolve) => {
        resolve(store.get(key));
      });
    },
    setItem: (key: string, item: any) => {
      return new Promise((resolve) => {
        resolve(store.set(key, item));
      });
    },
    removeItem: (key: string) => {
      return new Promise((resolve) => {
        resolve(store.delete(key));
      });
    },
  };
};

export function wrapAsync(fn: Promise<any>): Promise<[Error|undefined, any]> {
    return new Promise(resolve => {
        fn.then(res => {
              resolve([undefined, res]);
          })
          .catch((err: Error) => {
              resolve([err, undefined]);
          });
    });
}

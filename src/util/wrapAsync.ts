export function wrapAsync(fn: Promise<any>) {
    return new Promise(resolve => {
        fn.then(res => {
              resolve([undefined, res]);
          })
          .catch(err => {
              resolve([err]);
          });
    });
}

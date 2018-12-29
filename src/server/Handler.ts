import * as debug from 'debug';

const log = debug('paraplu:handler');

export async function Handle(fn: Function) {
  try {
    await fn();
  } catch (ex) {
    log(ex);
    Handle(fn);
  }
}
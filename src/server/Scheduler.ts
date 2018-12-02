import * as debug from 'debug'
import { IntervalWorker } from './IntervalWorker';

export async function Start(worker: IntervalWorker, interval: number) {
  const log = debug(worker.Name)
  log(`Starting.`)
  await worker.Scan()
  setTimeout(() => {
    this.Start(worker, interval)
  }, interval);
}
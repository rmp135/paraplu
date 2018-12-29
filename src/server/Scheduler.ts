import * as debug from 'debug'
import { IntervalWorker } from './IntervalWorker';
import { Handle } from './Handler';

export async function Start(worker: IntervalWorker, interval: number) {
  const log = debug(worker.Name)
  log(`Starting.`)
  await Handle(worker.Run.bind(worker))
  setTimeout(async () => {
    await this.Start(worker, interval)
  }, interval);
}
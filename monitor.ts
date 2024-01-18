import { startApplication } from './src/app';
const TIME_TO_RESTART_APPLICATION_IN_SECONDS = 10;

const startLoop = () => {
  return new Promise((res) => {
    setTimeout(async () => {
      try {
        await startApplication();
        await startLoop();
        res(true);
      } catch (ex) {
        res(false);
      }
    }, TIME_TO_RESTART_APPLICATION_IN_SECONDS * 1000);
  });
};

const monitor = async () => {
  try {
    await startApplication();
    await startLoop();
  } catch (ex) {
    monitor();
  }
};

monitor();

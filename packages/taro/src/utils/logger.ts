import { platform } from "./index";

export default class Logger {
  constructor(private readonly debug: boolean) {}

  public info = (message?: any, ...optionalParams: any[]) => {
    if (this.debug) {
      const data = optionalParams.map((item) => {
        if (
          platform !== "devtools" &&
          ((item.src && item.src.startsWith("data:image")) ||
            (item.defaultSrc && item.defaultSrc.startsWith("data:image")))
        ) {
          return {
            ...item,
            src: item.src.slice(0, 100) + "...",
          };
        }

        return item;
      });

      console.info(message, ...data);
    }
  };

  public time = (message: string) => {
    if (this.debug) {
      console.time(message);
    }
  };

  public timeEnd = (message: string) => {
    if (this.debug) {
      console.timeEnd(message);
    }
  };

  public group = (...labels: any[]) => {
    if (this.debug) {
      console.group(...labels);
    }
  };

  public groupEnd = () => {
    if (this.debug) {
      console.groupEnd();
    }
  };
}

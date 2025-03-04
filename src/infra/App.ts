import { Tcp } from "./Tcp";
import connectDB from "../helpers/db";

import { IService } from "types/services";

export class App implements IService {
  private static instance: App;

  private tcp: IService = new Tcp();

  constructor() {
    if (!App.instance) {
      App.instance = this;
    }

    return App.instance;
  }

  async init() {
    const { tcp } = this;
    console.log("App started");

    await connectDB();
    await tcp.init();

    return true;
  }
}
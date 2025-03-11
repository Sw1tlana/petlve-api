import { Tcp } from "./Tcp";
import connectDB from "../helpers/db";

export class App  {
  private static instance: App;
  private tcp: Tcp;


  constructor() {
    if (!App.instance) {
      App.instance = this;
      this.tcp = new Tcp();
    }

    return App.instance;
  }

  async init() {
    const { tcp } = this;
    console.log("App started");

    await connectDB();
    await this.tcp.init();

    return true;
  }
}
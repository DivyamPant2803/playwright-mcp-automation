import { Browser, BrowserContext, Page, chromium } from 'playwright';

export class PlaywrightManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  async getPage(): Promise<Page> {
    if (!this.browser) {
      const headless = process.env.HEADLESS !== 'false'; // Default to headless unless explicitly set to false
      this.browser = await chromium.launch({
        headless: headless,
      });
    }

    if (!this.context) {
      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
      });
    }

    if (!this.page) {
      this.page = await this.context.newPage();
    }

    return this.page;
  }

  async close() {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.context) {
      await this.context.close();
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async newPage(): Promise<Page> {
    const context = await this.getContext();
    this.page = await context.newPage();
    return this.page;
  }

  async getContext(): Promise<BrowserContext> {
    if (!this.browser) {
      const headless = process.env.HEADLESS !== 'false'; // Default to headless unless explicitly set to false
      this.browser = await chromium.launch({
        headless: headless,
      });
    }

    if (!this.context) {
      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
      });
    }

    return this.context;
  }
}



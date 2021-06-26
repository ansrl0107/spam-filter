import { URL } from 'url'

class SpamFilter {
  private spamLinkDomainSet: Set<string>

  public constructor(spamLinkDomains: string[]) {
    this.spamLinkDomainSet = new Set(spamLinkDomains)
  }

  public isSpam(urlString: string): boolean {
    const { hostname } = new URL(urlString)  
    return this.spamLinkDomainSet.has(hostname)
  }

  public isSomeUrlSpam(urls: string[]): boolean {
    return urls.some((url) => this.isSpam(url))
  }
}

export { SpamFilter }

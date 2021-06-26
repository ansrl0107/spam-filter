import cheerio from 'cheerio'

class LinkParser {
  public constructor() {

  }

  public fromText(plainText: string): string[] {
    const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g

    const result = plainText.match(regex)

    if (result === null) return []

    return result
  }

  public fromHtml(html: string): string[] {
    const $ = cheerio.load(html)

    const links: string[] = []
    $('a').each((idx, el) => {
      const link = $(el).attr('href')
      if (link) links.push(link)
    })
  
    return links
  }
}

export { LinkParser }

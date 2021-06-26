import axios from 'axios'
import { URL } from 'url'
import { LinkParser } from './src/linkParser'
import { SpamFilter } from './src/spamFilter'

const visitedUrlSet = new Set<string>()

const findRedirectUrls = async (url: string): Promise<string[]> => {
  const axiosInstance = axios.create({
    timeout: 5 * 1000,
  })
  const linkParser = new LinkParser()

  try {
    const res = await axiosInstance.get(url)
    const links: string[] = []
    switch (res.status) {
      case 200:
        links.push(...linkParser.fromHtml(res.data))
        break
      case 301:
      case 302:
        const redirectUrl = res.headers['Location'] || res.headers['location']
        if (redirectUrl) links.push(redirectUrl)
        break
      default:
        console.warn(`Unexpected status code: ${res.status}`)
        break
    }

    const normalizedLinkSet = links.map((link) => new URL(link, url).toString())
      .map((url) => url.replace(/\/$/, ''))
      .map((url) => url.replace(/\/\?/, '?'))
      .reduce((acc, cur) => {
        acc.add(cur)
        return acc
      }, new Set<string>())

    const normalizedLinks = Array.from(normalizedLinkSet.values())
    
    return normalizedLinks
  } catch (err) {
    return []
  }
}

const isSpam = async (content: string, spamLinkDomains: string[], redirectionDepth: number): Promise<boolean> => {
  if (redirectionDepth < 0) return false

  const linkParser = new LinkParser()
  const spamFilter = new SpamFilter(spamLinkDomains)

  const urls = linkParser.fromText(content)
  if (urls.length === 0) return false

  if (spamFilter.isSomeUrlSpam(urls)) return true

  // De-duplicate HTTP request via check duplicate request url (using in-momery cache)
  const notVisitedUrls = urls.filter((url) => visitedUrlSet.has(url) === false)
  urls.forEach((url) => visitedUrlSet.add(url))

  // Parallelize HTTP requests
  const nestedRedirectUrls = await Promise.all(notVisitedUrls.map((url) => findRedirectUrls(url)))

  const redirectUrls = nestedRedirectUrls.reduce((acc, cur) => acc.concat(...cur), [])
  if (redirectUrls.length === 0) return false

  if (spamFilter.isSomeUrlSpam(redirectUrls)) return true

  const result = await isSpam(redirectUrls.join(' '), spamLinkDomains, redirectionDepth - 1)
  return result
}

import { LinkParser } from '../src/linkParser'

let linkParser: LinkParser
beforeEach(() => {
  linkParser = new LinkParser()
})

describe('LinkParser:fromText', () => {
  it('should return link', () => {
    const links = linkParser.fromText('spam spam https://google.com')
    expect(links).toHaveLength(1)
    expect(links[0]).toEqual('https://google.com')
  })

  it('should return links', () => {
    const links = linkParser.fromText('spam spam https://google.com https://naver.com')
    expect(links).toHaveLength(2)
    expect(links).toContain('https://google.com')
    expect(links).toContain('https://naver.com')
  })

  it('should not return any link', () => {
    const links = linkParser.fromText('spam spam spam')
    expect(links).toHaveLength(0)
  })
})
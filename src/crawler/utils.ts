import { UA_POOL, INDEX_URL } from './config';
import axios from 'axios';
import iconv from 'iconv-lite';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const getRandomUserAgent = () => {
  return UA_POOL[Math.floor(Math.random() * UA_POOL.length)];
};

/**
 * Fetch a page with random User-Agent and decode as gbk
 * 使用随机 User-Agent 爬取页面并以 gbk 解码
 *
 * @param url 页面链接 / Page URL
 * @returns Promise<string> HTML 内容
 */
const fetchPageWithUA = async (url: string): Promise<string> => {
  const userAgent = getRandomUserAgent();
  const response = await axios.get(url, {
    headers: {
      'User-Agent': userAgent,
    },
    responseType: 'arraybuffer',
  });
  return iconv.decode(Buffer.from(response.data), 'gbk');
};

/**
 * Fetch, parse, and append posts with "招生" in <th class="thread-name"> to Data/source.json
 * 爬取、解析并追加 <th class="thread-name"> 内含"招生"的所有帖子到 Data/source.json，按 id 去重，最大 1000 条
 *
 * @returns Promise<Array<{tag: string, title: string, url: string, id: string}>> 帖子信息数组
 */
const fetchIndexUrl = async (): Promise<
  Array<{
    tag: string;
    title: string;
    url: string;
    id: string;
    timestamp?: number;
  }>
> => {
  const html = await fetchPageWithUA(INDEX_URL);
  const $ = cheerio.load(html);
  const baseUrl = 'https://muchong.com';
  const results: Array<{
    tag: string;
    title: string;
    url: string;
    id: string;
    timestamp: number;
  }> = [];
  $('tr.forum_list').each((_, tr) => {
    const threadNameTh = $(tr).find('th.thread-name');
    const typeText = threadNameTh.find('span > a.xmc_blue').text();
    if (typeText.includes('招生')) {
      const postA = threadNameTh.find('a.a_subject');
      const title = postA.text().trim();
      let url = postA.attr('href') || '';
      url = url.startsWith('http') ? url : baseUrl + url;
      const id = crypto.createHash('md5').update(url).digest('hex');

      // 从页面提取时间 / Extract date from the page
      const dateStr = $(tr).find('td.by em').text().trim();
      let timestamp = new Date().getTime(); // Fallback
      if (dateStr) {
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          timestamp = parsedDate.getTime();
        }
      }

      results.push({
        tag: typeText,
        title,
        url,
        id,
        timestamp: timestamp,
      });
    }
  });
  const dataDirFixed = path.resolve(__dirname, '../web/assets');
  if (!fs.existsSync(dataDirFixed)) {
    fs.mkdirSync(dataDirFixed, { recursive: true });
  }
  const filePath = path.join(dataDirFixed, 'source.json');
  let existing: Array<{
    tag: string;
    title: string;
    url: string;
    id: string;
    timestamp?: number;
  }> = [];
  if (fs.existsSync(filePath)) {
    try {
      existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      existing = [];
    }
  }
  // 将现有数据先放入 Map，实现增量添加 / Put existing data into Map first for incremental addition
  const dedupedMap = new Map<
    string,
    { tag: string; title: string; url: string; id: string; timestamp?: number }
  >();

  // 先添加现有数据 / Add existing data first
  for (const item of existing) {
    dedupedMap.set(item.id, item);
  }

  // 只添加不存在的新数据，跳过已存在的 ID / Only add new data that doesn't exist, skip existing IDs
  for (const item of results) {
    if (!dedupedMap.has(item.id)) {
      dedupedMap.set(item.id, item);
    }
  }

  // 按 timestamp 从最新到最老排序，保留最新 1000 条 / Sort by timestamp from newest to oldest, keep latest 1000
  const deduped = Array.from(dedupedMap.values())
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    .slice(0, 1000);
  fs.writeFileSync(filePath, JSON.stringify(deduped, null, 2), 'utf-8');
  return deduped;
};

// forumMix 字段 key 的中英文映射 / Mapping for forumMix keys
const forumMixKeyMap: Record<string, string> = {
  学校: 'school',
  专业: 'major',
  年级: 'grade',
  招生人数: 'quota',
  招生状态: 'status',
  联系方式: 'contact',
};

/**
 * 并发爬取详情页，提取有效信息，失败打标记，最终保存到 source.json
 * Crawl post details concurrently (max 5), extract info, mark failed, remove failed, save to source.json
 *
 * @returns Promise<Array<{ id: string; url: string; detail: object }>>
 */
const fetchPostsDetail = async (): Promise<
  Array<{
    id: string;
    url: string;
    detail: any;
    ok: boolean;
    timestamp: number;
  }>
> => {
  const dataDirFixed = path.resolve(__dirname, '../web/assets');
  const filePath = path.join(dataDirFixed, 'source.json');
  if (!fs.existsSync(filePath)) {
    throw new Error('source.json not found');
  }
  let posts: Array<any> = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const results: Array<{
    id: string;
    url: string;
    detail: any;
    ok: boolean;
    timestamp: number;
  }> = [];

  const concurrency = 5;
  let idx = 0;
  async function worker() {
    while (idx < posts.length) {
      const current = idx++;
      const post = posts[current];
      // 已经 ok 的跳过 / Skip if already ok
      if (post.ok) {
        results.push(post);
        continue;
      }
      try {
        const html = await fetchPageWithUA(post.url);
        const $ = cheerio.load(html);
        let forumMix: any = {};
        const forumDiv = $('div.forum_Mix');
        if (forumDiv.length) {
          forumDiv.find('table.adjust_table tr').each((_, tr) => {
            const tds = $(tr).find('td');
            if (tds.length === 2) {
              let key = $(tds[0])
                .text()
                .replace(/[:：\s]/g, '')
                .trim();
              let value = $(tds[1])
                .text()
                .replace(/\s{2,}/g, ' ')
                .trim();
              if (key && value) {
                key = forumMixKeyMap[key] || key;
                forumMix[key] = value;
              }
            }
          });
        }
        // 只取第一个 div.t_fsz 元素的 HTML 内容，移除其中所有 img 标签 / Only extract the first div.t_fsz element's HTML content and remove all img tags
        let content = '';
        const tfszDiv = $('div.t_fsz').first();
        if (tfszDiv.length) {
          // 移除 img 标签 / Remove img tags
          tfszDiv.find('img').remove();
          content = tfszDiv.html() || '';
        }
        results.push({
          ...post,
          detail: {
            forumMix,
            content,
          },
          ok: true,
        });
      } catch (e) {
        results.push({
          ...post,
          detail: {},
          ok: false,
        });
      }
    }
  }
  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  // Sort by timestamp from newest to oldest
  const sorted = results.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  fs.writeFileSync(filePath, JSON.stringify(sorted, null, 2), 'utf-8');
  return sorted.filter((item) => item.ok);
};

export { getRandomUserAgent, fetchIndexUrl, fetchPostsDetail, fetchPageWithUA };

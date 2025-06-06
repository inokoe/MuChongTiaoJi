import { fetchIndexUrl, fetchPostsDetail } from './utils';

(async () => {
  try {
    // 调用 fetchIndexUrl，自动保存数据 / Call fetchIndexUrl, data will be saved automatically
    await fetchIndexUrl();
    console.log(
      /**
       * Data has been fetched and saved to src/assets/source.json
       * 数据已保存到 src/assets/source.json
       */
      'Data has been fetched and saved to src/assets/source.json / 数据已保存到 src/assets/source.json',
    );
    // 调用 fetchPostsDetail 并打印结果数量 / Call fetchPostsDetail and print result count
    const details = await fetchPostsDetail();
    console.log(
      `Detail pages fetched and parsed: ${details.length} / 详情页处理数量: ${details.length}`,
    );
  } catch (error) {
    // 直接报错并退出程序 / Throw error and exit process
    console.error('Error fetching INDEX_URL / 爬取 INDEX_URL 出错:', error);
    process.exit(1);
  }
})();

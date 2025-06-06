/**
 * Forum mix information type / 论坛混合信息类型
 */
export interface ForumMix {
  school: string;
  major: string;
  grade: string;
  quota: string;
  status: string;
  contact: string;
}

/**
 * Detail information type / 详细信息类型
 */
export interface Detail {
  forumMix: ForumMix;
  content: string;
}

/**
 * Recruitment item type / 招生项目类型
 */
export interface RecruitmentItem {
  tag: string;
  title: string;
  url: string;
  id: string;
  timestamp: number;
  detail: Detail;
  ok: boolean;
}

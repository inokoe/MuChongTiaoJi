import React, { useState, useMemo, useCallback, useEffect, useRef, startTransition } from 'react';
import { Input, Select, Row, Col, Spin, Empty, Typography, Space, Pagination } from 'antd';
import { SearchOutlined, FilterOutlined, BookOutlined } from '@ant-design/icons';
import RecruitmentCard from './RecruitmentCard';
import { RecruitmentItem } from '../types';
import sourceData from '../assets/source.json';
import styles from './RecruitmentList.module.css';

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

/**
 * Recruitment information list component / 招生信息列表组件
 * Displays filterable and searchable list of recruitment information with pagination
 * 展示可过滤、搜索和分页的招生信息列表
 *
 * @returns RecruitmentList component / 招生信息列表组件
 */
const RecruitmentList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);

  // Pagination state variables / 分页状态变量
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6); // Default 6 items per page / 默认每页6条

  // Add transition state for smooth page changes / 添加过渡状态以实现平滑页面切换
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Refs for debouncing and optimization / 用于防抖和优化的引用
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Type assertion for imported JSON data
  // 为导入的JSON数据进行类型断言
  const recruitmentData = sourceData as RecruitmentItem[];

  // Smooth scroll to top function / 平滑滚动到顶部函数
  const scrollToTop = useCallback(() => {
    // Use requestAnimationFrame for smoother scrolling
    // 使用 requestAnimationFrame 实现更流畅的滚动
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    });
  }, []);

  // Debounced search function / 防抖搜索函数
  const debouncedSearch = useCallback(
    (value: string) => {
      // Clear existing timeout / 清除现有的超时
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set loading state immediately for visual feedback
      // 立即设置加载状态以提供视觉反馈
      setLoading(true);

      searchTimeoutRef.current = setTimeout(() => {
        // Use startTransition for non-urgent updates
        // 使用 startTransition 处理非紧急更新
        startTransition(() => {
          setSearchTerm(value);
          setCurrentPage(1);
        });

        // Clear loading state after a short delay
        // 短暂延迟后清除加载状态
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }

        loadingTimeoutRef.current = setTimeout(() => {
          setLoading(false);
          if (value) {
            scrollToTop();
          }
        }, 100);
      }, 300); // 300ms debounce delay / 300ms 防抖延迟
    },
    [scrollToTop],
  );

  // Clean up timeouts on component unmount / 组件卸载时清理超时
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Extract unique values for filter options (memoized for performance)
  // 提取唯一值用于过滤选项（缓存以提高性能）
  const { uniqueTags, uniqueSchools } = useMemo(() => {
    const tags = new Set<string>();
    const schools = new Set<string>();

    recruitmentData.forEach((item) => {
      tags.add(item.tag);
      schools.add(item.detail.forumMix.school);
    });

    return {
      uniqueTags: Array.from(tags),
      uniqueSchools: Array.from(schools).sort(),
    };
  }, [recruitmentData]);

  // Filter and search data based on current state (optimized with useMemo)
  // 根据当前状态过滤和搜索数据（使用 useMemo 优化性能）
  const filteredData = useMemo(() => {
    let filtered = recruitmentData.filter((item) => item.ok);

    // Filter by tag
    // 按标签过滤
    if (selectedTag !== 'all') {
      filtered = filtered.filter((item) => item.tag === selectedTag);
    }

    // Filter by school
    // 按学校过滤
    if (selectedSchool !== 'all') {
      filtered = filtered.filter((item) => item.detail.forumMix.school === selectedSchool);
    }

    // Search in title, school, and major
    // 在标题、学校和专业中搜索
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(lowerSearchTerm) ||
          item.detail.forumMix.school.toLowerCase().includes(lowerSearchTerm) ||
          item.detail.forumMix.major.toLowerCase().includes(lowerSearchTerm),
      );
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }, [recruitmentData, searchTerm, selectedTag, selectedSchool]);

  // Calculate paginated data (optimized with useMemo)
  // 计算分页数据（使用 useMemo 优化性能）
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  // Handle search input change (optimized with useCallback and debouncing)
  // 处理搜索输入变化（使用 useCallback 和防抖优化性能）
  const handleSearch = useCallback(
    (value: string) => {
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  // Handle filter changes (optimized with useCallback)
  // 处理筛选变化（使用 useCallback 优化性能）
  const handleTagChange = useCallback(
    (value: string) => {
      startTransition(() => {
        setSelectedTag(value);
        setCurrentPage(1); // Reset to first page when filtering / 筛选时重置到第一页
      });
      scrollToTop(); // Scroll to top after filtering / 筛选后滚动到顶部
    },
    [scrollToTop],
  );

  const handleSchoolChange = useCallback(
    (value: string) => {
      startTransition(() => {
        setSelectedSchool(value);
        setCurrentPage(1); // Reset to first page when filtering / 筛选时重置到第一页
      });
      scrollToTop(); // Scroll to top after filtering / 筛选后滚动到顶部
    },
    [scrollToTop],
  );

  // Reset all filters (optimized with useCallback)
  // 重置所有过滤器（使用 useCallback 优化性能）
  const handleReset = useCallback(() => {
    // Clear any pending search timeouts / 清除任何待处理的搜索超时
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    startTransition(() => {
      setSearchTerm('');
      setSelectedTag('all');
      setSelectedSchool('all');
      setCurrentPage(1); // Reset to first page / 重置到第一页
    });
    setLoading(false); // Clear loading state / 清除加载状态
    scrollToTop(); // Scroll to top after reset / 重置后滚动到顶部
  }, [scrollToTop]);

  // Handle pagination change with smooth transitions
  // 处理分页变化并实现平滑过渡
  const handlePageChange = useCallback(
    (page: number, size?: number) => {
      // Start transition effect immediately / 立即开始过渡效果
      setIsTransitioning(true);

      // Clear any existing transition timeout / 清除现有的过渡超时
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      // Use startTransition for smooth state updates
      // 使用 startTransition 实现平滑的状态更新
      startTransition(() => {
        if (size && size !== pageSize) {
          setPageSize(size);
          setCurrentPage(1); // Reset to first page when page size changes / 页面大小改变时重置到第一页
        } else {
          setCurrentPage(page);
        }
      });

      // Smooth scroll to top immediately, before content changes
      // 在内容变化前立即开始平滑滚动到顶部
      scrollToTop();

      // End transition effect after content has updated
      // 内容更新后结束过渡效果
      transitionTimeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 200); // Short delay to allow for smooth transition / 短暂延迟以允许平滑过渡
    },
    [pageSize, scrollToTop],
  );

  // Handle search input change without triggering immediate search
  // 处理搜索输入变化但不立即触发搜索（优化用户体验）
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      // Clear search immediately when input is empty / 输入为空时立即清除搜索
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      startTransition(() => {
        setSearchTerm('');
        setCurrentPage(1);
      });
      setLoading(false);
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={2} className={styles.headerTitle}>
          <BookOutlined /> 最新招生信息
        </Title>
        <div className={styles.stats}>
          <span>共找到 {filteredData.length} 条招生信息</span>
        </div>
      </div>

      <div className={styles.filters}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={8} lg={8}>
            <Search
              placeholder="搜索学校、专业或标题..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              onChange={handleSearchInputChange}
              className={styles.searchInput}
              loading={loading} // Show loading state in search input / 在搜索输入框中显示加载状态
            />
          </Col>

          <Col xs={12} sm={12} md={4} lg={4}>
            <Select
              value={selectedTag}
              onChange={handleTagChange}
              size="large"
              className={styles.filterSelect}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">所有类型</Option>
              {uniqueTags.map((tag) => (
                <Option key={tag} value={tag}>
                  {tag}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={12} sm={12} md={6} lg={6}>
            <Select
              value={selectedSchool}
              onChange={handleSchoolChange}
              size="large"
              className={styles.filterSelect}
              placeholder="选择学校"
              showSearch
              optionFilterProp="children"
            >
              <Option value="all">所有学校</Option>
              {uniqueSchools.map((school) => (
                <Option key={school} value={school}>
                  {school}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={24} md={6} lg={6}>
            <Space>
              <button onClick={handleReset} className={styles.resetButton}>
                重置筛选
              </button>
            </Space>
          </Col>
        </Row>
      </div>

      <div
        className={`${styles.content} ${loading ? styles.loading : ''} ${
          isTransitioning ? styles.transitioning : ''
        }`}
      >
        <Spin spinning={loading} size="large" tip="加载中...">
          {filteredData.length > 0 ? (
            <>
              <div className={styles.cardsContainer}>
                <Row gutter={[24, 24]} key={`page-${currentPage}-${pageSize}`}>
                  {paginatedData.map((item) => (
                    <Col key={item.id} xs={24} lg={12} xl={12}>
                      <RecruitmentCard item={item} />
                    </Col>
                  ))}
                </Row>
              </div>

              {/* Pagination component with optimized performance / 性能优化的分页组件 */}
              <div className={styles.paginationContainer}>
                <Pagination
                  current={currentPage}
                  total={filteredData.length}
                  pageSize={pageSize}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条数据`}
                  pageSizeOptions={['6', '12', '24', '48']}
                  onChange={handlePageChange}
                  onShowSizeChange={handlePageChange}
                  className={styles.pagination}
                  hideOnSinglePage={false} // Always show pagination for consistency / 始终显示分页以保持一致性
                  disabled={loading || isTransitioning} // Disable pagination during loading or transition / 加载或过渡期间禁用分页
                />
              </div>
            </>
          ) : (
            <Empty description="暂无符合条件的招生信息" className={styles.empty} />
          )}
        </Spin>
      </div>
    </div>
  );
};

export default RecruitmentList;

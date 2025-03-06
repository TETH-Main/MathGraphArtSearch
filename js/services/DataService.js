/**
 * データ取得と処理を担当するサービスクラス
 */
class DataService {
    /**
     * DataServiceのコンストラクタ
     */
    constructor() {
        this.videos = [];
        this.secretVideos = [];
        this.tags = new Set();
    }

    /**
     * Google Spreadsheetからデータを取得
     * @returns {Promise<boolean>} 成功したらtrue、失敗したらfalse
     */
    async fetchData() {
        try {
            // fetch-application.jsを参考にしたデータ取得
            const url = 'https://script.google.com/macros/s/AKfycby1uK606WpIBfn6oxRaALBsUDgL4RO0Z6KYap5H_kaf9P8MCHX8ywfadbW8A53QiLjt4Q/exec?id=17SwwPJ8A4U0E4vjd8ogkUozaFu14pPDHaZnjRoQIB44&name=data';

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // データの処理
            this.processData(data);
            return true;
        } catch (error) {
            console.error('データの取得に失敗しました:', error);
            return false;
        }
    }

    /**
     * 取得したデータを処理
     * @param {Array} data - APIから取得したデータ
     */
    processData(data) {
        // データ形式に応じて処理を変更
        // APIのレスポンス形式に合わせて調整が必要
        this.videos = data.map(entry => Video.fromSpreadsheetEntry(entry));

        // 通常の動画と限定公開動画を分離
        this.secretVideos = this.videos.filter(video => video.isSecret);
        this.videos = this.videos.filter(video => !video.isSecret);

        // すべてのタグを収集
        this.collectTags();
    }

    /**
     * すべての動画からタグを収集
     */
    collectTags() {
        this.tags.clear();
        this.videos.forEach(video => {
            video.tags.forEach(tag => {
                if (tag) this.tags.add(tag);
            });
        });
    }

    /**
     * 検索条件に基づいて動画をフィルタリング
     * @param {Object} searchParams - 検索パラメータ
     * @returns {Array} フィルタリングされた動画の配列
     */
    filterVideos(searchParams) {
        const { keyword, selectedTags, dateFilter, episodeFilter } = searchParams;

        return this.videos.filter(video => {
            // キーワード検索
            const matchesKeyword = !keyword ||
                video.title.toLowerCase().includes(keyword.toLowerCase()) ||
                video.description.toLowerCase().includes(keyword.toLowerCase());

            // タグ検索
            const matchesTags = !selectedTags || selectedTags.length === 0 ||
                selectedTags.every(tag => video.tags.includes(tag));

            // 話数検索
            // 話数検索
            const matchesEpisode = !episodeFilter || 
                (typeof video.episode === 'string' && video.episode.toLowerCase().includes(episodeFilter.toLowerCase()));

            // 日付検索
            const matchesDate = !dateFilter ||
                DateUtils.isWithinPeriod(video.date, dateFilter);

            return matchesKeyword && matchesTags && matchesEpisode && matchesDate;
        });
    }

    /**
     * 動画を指定された条件でソート
     * @param {Array} videos - ソートする動画の配列
     * @param {string} sortOption - ソートオプション
     * @returns {Array} ソートされた動画の配列
     */
    sortVideos(videos, sortOption) {
        const sortedVideos = [...videos];

        switch (sortOption) {
            case 'date-desc': // 新しい順
                sortedVideos.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'date-asc': // 古い順
                sortedVideos.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'title-asc': // タイトル昇順
                sortedVideos.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-desc': // タイトル降順
                sortedVideos.sort((a, b) => b.title.localeCompare(a.title));
                break;
        }

        return sortedVideos;
    }

    /**
     * タグの使用頻度を集計
     * @returns {Object} タグとその使用頻度のマップ
     */
    getTagCounts() {
        const tagCounts = {};

        this.videos.forEach(video => {
            video.tags.forEach(tag => {
                if (tag) {
                    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                }
            });
        });

        return tagCounts;
    }

    /**
     * 使用頻度順にソートされたタグを取得
     * @param {number} limit - 取得するタグの最大数
     * @returns {Array} タグの配列
     */
    getPopularTags(limit = 15) {
        const tagCounts = this.getTagCounts();

        // 使用頻度順にソート
        return Object.keys(tagCounts)
            .sort((a, b) => tagCounts[b] - tagCounts[a])
            .slice(0, limit);
    }

    /**
     * 限定公開動画を取得
     * @returns {Array} 限定公開動画の配列
     */
    getSecretVideos() {
        return this.secretVideos;
    }

    /**
     * すべてのタグを取得
     * @returns {Array} タグの配列
     */
    getAllTags() {
        return Array.from(this.tags).sort();
    }
}

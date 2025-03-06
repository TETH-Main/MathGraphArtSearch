/**
 * 検索機能を担当するコントローラークラス
 */
class SearchController {
    /**
     * SearchControllerのコンストラクタ
     * @param {DataService} dataService - データサービス
     */
    constructor(dataService) {
        this.dataService = dataService;

        // 検索パラメータ
        this.searchParams = {
            keyword: '',
            selectedTags: [],
            dateFilter: '',
            episodeFilter: '',
            sortOption: 'date-desc',
            currentPage: 1,
            itemsPerPage: 12
        };

        // フィルタリングされた動画
        this.filteredVideos = [];
    }

    /**
     * 検索パラメータを設定
     * @param {Object} params - 検索パラメータ
     */
    setSearchParams(params) {
        Object.assign(this.searchParams, params);
    }

    /**
     * 検索パラメータを取得
     * @returns {Object} 検索パラメータ
     */
    getSearchParams() {
        return { ...this.searchParams };
    }

    /**
     * 選択されたタグを取得
     * @returns {Array} 選択されたタグの配列
     */
    getSelectedTags() {
        return [...this.searchParams.selectedTags];
    }

    /**
     * タグの選択・非選択を切り替え
     * @param {string} tag - タグ
     */
    toggleTag(tag) {
        const index = this.searchParams.selectedTags.indexOf(tag);

        if (index === -1) {
            this.searchParams.selectedTags.push(tag);
        } else {
            this.searchParams.selectedTags.splice(index, 1);
        }

        // 検索を実行
        this.search();
    }

    /**
     * 検索を実行
     */
    search() {
        // 現在のページを1に戻す
        this.searchParams.currentPage = 1;

        // 動画をフィルタリング
        this.filteredVideos = this.dataService.filterVideos(this.searchParams);

        // 動画をソート
        this.filteredVideos = this.dataService.sortVideos(
            this.filteredVideos,
            this.searchParams.sortOption
        );

        // URLパラメータを更新
        UrlUtils.updateUrlParams(this.searchParams);

        return this.filteredVideos;
    }

    /**
     * 並び替えを実行
     * @param {string} sortOption - ソートオプション
     */
    sort(sortOption) {
        this.searchParams.sortOption = sortOption;

        // 動画をソート
        this.filteredVideos = this.dataService.sortVideos(
            this.filteredVideos,
            this.searchParams.sortOption
        );

        // URLパラメータを更新
        UrlUtils.updateUrlParams(this.searchParams);

        return this.filteredVideos;
    }

    /**
     * フィルタリングされた動画を取得
     * @returns {Array} フィルタリングされた動画の配列
     */
    getFilteredVideos() {
        return [...this.filteredVideos];
    }

    /**
     * 隠しコマンドを検証
     * @param {string} command - 入力されたコマンド
     * @param {string} secretCommand - 正しい隠しコマンド
     * @returns {boolean} コマンドが一致すればtrue
     */
    validateSecretCommand(command, secretCommand) {
        return command.trim() === secretCommand;
    }
}
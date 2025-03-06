/**
 * 動画データのモデルクラス
 */
class Video {
    /**
     * 動画モデルのコンストラクタ
     * @param {Object} data - 動画データオブジェクト
     */
    constructor(data) {
        this.date = data.date || '';
        this.episode = data.episode || '';
        this.thumbnail = data.thumbnail || '';
        this.title = data.title || '';
        this.description = data.description || '';
        this.duration = data.duration || '';
        this.tags = Array.isArray(data.tags) ? data.tags : [];
        this.videoId = data.videoId || '';
        this.isSecret = data.isSecret || false;
    }

    /**
     * スプレッドシートのデータから動画オブジェクトを作成
     * @param {Object} entry - スプレッドシートのエントリ
     * @returns {Video} 動画オブジェクト
     */
    static fromSpreadsheetEntry(entry) {
        return new Video({
            date: entry.upload_datetime || '',
            episode: entry.episode_number || '',
            thumbnail: entry.thumbnail_url || '',
            title: entry.title || '',
            description: entry.description || '',
            duration: entry.video_duration || '',
            tags: entry.tags ? entry.tags.split(',').map(tag => tag.trim()) : [],
            videoId: entry.video_id || '',
            isSecret: entry.type === 'secret'
        });
    }

    /**
     * サムネイルURLを取得（なければデフォルトのYouTubeサムネイルを使用）
     * @returns {string} サムネイルURL
     */
    getThumbnailUrl() {
        return this.thumbnail || `https://i.ytimg.com/vi/${this.videoId}/hqdefault.jpg`;
    }

    /**
     * YouTube動画のURLを取得
     * @returns {string} YouTube動画のURL
     */
    getVideoUrl() {
        return `https://www.youtube.com/watch?v=${this.videoId}`;
    }
}

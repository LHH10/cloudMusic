<template>
	<view class="detail">
		<view class="fixbg" :style="{backgroundImage:'url('+songDetail.al.picUrl+')'}"></view>
		<musichead :title="songDetail.name + ''" :iconblack="false" :icon="true" color="white"></musichead>
		<view class="container" v-show="!isLoading">
			<scroll-view scroll-y="true" >
				<view class="detail-play" @tap="handleToPlay">
					<image :src="songDetail.al.picUrl" :class="{'detail-play-run' : isPlayRotate}" mode=""></image>
					<text class="iconfont" :class="iconPlay"></text>
					<view></view>
				</view>
				<view class="detail-lyric">
					<view class="detail-lyric-wrap" :style="{transform : 'translateY('+ -(lyricIndex-1) * 82 +'rpx)'}">	
						<view class="detail-lyric-item" :class="{active : lyricIndex == index}" v-for="(item,index) in songLyric" :key="index">{{item.lyric}}</view>
					</view>
				</view>
				<view class="detail-like">
					<view class="detail-like-head">喜欢听这首歌的人也听</view>
					<view class="detail-like-item" v-for="(item,index) in songSimi" :key="index" @tap="handleToSimi(item.id)">
						<view class="detail-like-img">
							<image :src="item.album.picUrl" mode=""></image>
						</view>
						<view class="detail-like-song">
							<view>{{item.name}}</view>
							<view>
								<image v-if="item.privilege.flag > 60 && item.privilege.flag < 70" src="../../static/dujia.png" mode=""></image>
								<image v-if="item.privilege.maxbr == 320000" src="../../static/sq.png" mode=""></image>
								{{item.album.artists[0].name}} - {{item.name}}
							</view>
						</view>
						<text class="iconfont icon-bofang"></text>
					</view>
				</view>
				<view class="detail-comment">
					<view class="detail-comment-head">精彩评论</view>
					<view class="detail-comment-item" v-for="(item,index) in songComment" :key="index">
						<view class="detail-comment-img">
							<image :src="item.user.avatarUrl" mode=""></image>
						</view>
						<view class="detail-comment-content">
							<view class="detail-comment-title">
								<view class="detail-comment-name">
									<view>{{item.user.nickname}}</view>
									<view>{{item.time | formatTime}}</view>
								</view>
								<view class="detail-comment-like">{{item.likedCount | formatCount}} <text class="iconfont icon-dianzan"></text></view>
							</view>
							<view class="detail-comment-text">{{item.content}}</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import musichead from '../../components/musichead/musichead.vue'
	import {request} from '../../network/network.js'
	export default {
		data() {
			return {
				songDetail: {
					al: {
						picUrl: ''
					}
				},
				songSimi : [],
				songComment: [],
				songLyric: [],
				// 滚动歌词状态
				lyricIndex: 0,
				//播放状态控制
				iconPlay: 'icon-ico_zanting_xuanzhong',
				// 图片是否旋转
				isPlayRotate: true,
				isLoading: true
			};
		},
		components: {
			musichead
		},
		onLoad(options) {
			uni.showLoading({
				title: '正在加载中。。。'
			})
			this.isLoading = true
			// console.log(options.id)
			this.getSong(options.id);
		},
		onUnload() {
			this.cancelLyricIndex();
			//针对H5离开页面播放器仍在播放音乐，故需要使用destroy()销毁实例
			// #ifdef H5
			this.bgAudioManager.destroy();
			// #endif
		},
		onHide() {
			this.cancelLyricIndex();
			//针对H5离开页面播放器仍在播放音乐，故需要使用destroy()销毁实例
			// #ifdef H5
			this.bgAudioManager.destroy();
			// #endif
		},
		methods: {
			getSong(id) {
				this.$store.commit('NEXT_ID',id)
				//获取歌曲详情信息，如歌曲名字等
				request({url: '/song/detail',data:{ids:id}}).then(res => {
					// console.log(res)
					if(res.data.code == '200') {
						this.songDetail = res.data.songs[0]
					}
				})
			
				//获取相似歌单，喜欢听这首歌的人也听
				request({url: '/simi/song',data:{id}}).then(res => {
					// console.log(res)
					if(res.data.code == '200') {
						this.songSimi = res.data.songs
					}
				})
			
				//获取评论信息
				request({url: '/comment/music',data:{id}}).then(res => {
					// console.log(res)
					if(res.data.code == '200') {
						this.songComment = res.data.comments
					}
				})
			
				//获取歌词信息
				request({url: '/lyric',data:{id}}).then(res => {
					// console.log(res)
					if(res.data.code == '200') {
						let lyric = res.data.lrc.lyric
						let re = /\[([^\]]+)\]([^[]+)/g;
						var result = [];
						// 解构歌词,将歌词分段转化成数组
						lyric.replace(re,($0,$1,$2) => {
							result.push({"time": this.formatTimeToSec($1),"lyric": $2})
						});
						this.songLyric = result
					}
				})
			
				//获取播放音乐地址
				request({url: '/song/url',data:{id}}).then(res => {
					// console.log(res)
					if(res.data.code == '200') {
						// 支持微信小程序的播放器
						// #ifdef MP-WEIXIN
						this.bgAudioManager = uni.getBackgroundAudioManager();
						this.bgAudioManager.title = this.songDetail.name;
						// #endif
						
						// 支持H5的播放器
						// #ifdef H5
						if(!this.bgAudioManager) {
							this.bgAudioManager = uni.createInnerAudioContext();
						}
						this.iconPlay = 'icon-bofang1';
						this.isPlayRotate = false;
						// #endif
						
						this.bgAudioManager.src = res.data.data[0].url || '';
						this.listenLyricIndex();
						this.bgAudioManager.onPlay(() => {
							this.iconPlay = 'icon-ico_zanting_xuanzhong';
							this.isPlayRotate = true;
							this.listenLyricIndex();
						});
						this.bgAudioManager.onPause(() => {
							this.iconPlay = 'icon-bofang1';
							this.isPlayRotate = false;
							this.cancelLyricIndex();
						});
						this.bgAudioManager.onEnded(() => {
							this.getSong(this.$store.state.nextId)
						})
					}
				})
				this.isLoading = false;
				uni.hideLoading();
			},
			//转化歌词时间段，将分钟转换成秒
			formatTimeToSec(value) {
				let arr = value.split(':');
				//分钟转成秒再加上原先的秒数,如2分48.77秒，可能原先的时间段秒数小数较多，控制在一位小数
				return (Number(arr[0]*60) + Number(arr[1])).toFixed(1);
			},
			// 控制播放暂停
			handleToPlay() {
				if(this.bgAudioManager.paused) {
					this.bgAudioManager.play();
				}else {
					this.bgAudioManager.pause();
				}
			},
			// 监听歌词状态
			listenLyricIndex() {
				clearInterval(this.timer);
				this.timer = setInterval(() => {
					for(var i=0;i<this.songLyric.length;i++) {
						if(this.bgAudioManager.currentTime > this.songLyric[this.songLyric.length-1].time) {
							this.lyricIndex = this.songLyric.length-1;
							break;
						}
						if(this.bgAudioManager.currentTime > this.songLyric[i].time && this.bgAudioManager.currentTime < this.songLyric[i+1].time) {
							this.lyricIndex = i
						}
					}
				},500)
			},
			// 关闭播放定时器
			cancelLyricIndex() {
				clearInterval(this.timer);
			},
			// 相似歌曲的播放
			handleToSimi(id) {
				this.getSong(id);
			},
			
		}
	}
</script>

<style lang="less" scoped>
	.detail-play {
		width: 580rpx;
		height: 580rpx;
		background: url(../../static/disc.png);
		background-size: cover;
		margin: 214rpx auto 0 auto;
		position: relative;
		image {
			width: 370rpx;
			height: 370rpx;
			border-radius: 50%;
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			margin: auto;
			animation: 10s linear move infinite;
			animation-play-state: paused;
		}
		text {
			width: 100rpx;
			height: 100rpx;
			font-size: 100rpx;
			color: white;
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			margin: auto;
		}
		view {
			width: 230rpx;
			height: 360rpx;
			background: url(../../static/needle.png);
			position: absolute;
			left: 100rpx;
			right: 0;
			top: -200rpx;
			margin: auto;
			background-size: cover;
		}
	}
	.detail-play .detail-play-run {
		animation-play-state: running;
	}
	@keyframes move {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	.detail-lyric {
		font-size: 32rpx;
		line-height: 82rpx;
		height: 246rpx;
		text-align: center;
		overflow: hidden;
		color: #949495;
		.detail-lyric-wrap {
			transition: .5s;
			.detail-lyric-item {
				height: 82rpx;
			}
			.active {
				color: white;
			}
		}
	}
	.detail-like {
		margin: 0 30rpx;
		.detail-like-head {
			font-size: 36rpx;
			color: white;
			margin: 50rpx 0;
		}
		.detail-like-item {
			display: flex;
			align-items: center;
			margin-bottom: 28rpx;
			.detail-like-img {
				width: 82rpx;
				height: 82rpx;
				border-radius: 20rpx;
				overflow: hidden;
				margin-right: 20rpx;
				image {
					width: 100%;
					height: 100%;
				}
			}
			.detail-like-song {
				flex: 1;
				color: #c6c2bf;
				view:nth-child(1) {
					font-size: 28rpx;
					color: white;
					margin-bottom: 12rpx;
				}
				view:nth-child(2) {
					font-size: 22rpx;
					image {
						width: 26rpx;
						height: 20rpx;
						margin-right: 10rpx;
					}
				}
			}
			text {
				font-size: 50rpx;
				color: #c6c2bf;
			}
		}
	}
	.detail-comment {
		margin: 0 30rpx;
		.detail-comment-head {
			font-size: 36rpx;
			color: white;
			margin: 50rpx 0;
		}
		.detail-comment-item {
			margin-bottom: 28rpx;
			display: flex;
			.detail-comment-img {
				width: 64rpx;
				height: 64rpx;
				border-radius: 50%;
				overflow: hidden;
				margin-right: 18rpx;
				image {
					width: 100%;
					height: 100%;
				}
			}
			.detail-comment-content {
				flex: 1;
				color: #cbcacf;
				.detail-comment-title {
					display: flex;
					justify-content: space-between;
					.detail-comment-name {
						view:nth-child(1) {
							font-size: 26rpx;
						}
						view:nth-child(2) {
							font-size: 20rpx;
						}
					}
					.detail-comment-like {
						font-size: 28rpx;
					}
				}
				.detail-comment-text {
					font-size: 28rpx;
					line-height: 40rpx;
					color: white;
					margin-top: 20rpx;
					border-bottom: 1px #59595b solid;
					padding-bottom: 40rpx;
				}
			}
		}
	}
</style>

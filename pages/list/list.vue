<template>
	<view class="list">
		<view class="fixbg" :style="{backgroundImage: 'url('+ playList.coverImgUrl +')'}"></view>
		<musichead title="歌单" :iconblack="false" :icon="true" color="white"></musichead>
		<view class="container" v-show="!isLoading">
			<scroll-view scroll-y="true">
				<view class="list-head">
					<view class="list-head-img">
						<image :src="playList.coverImgUrl" mode=""></image>
						<text class="iconfont icon-yousanjiao">{{playList.playCount | formatCount}}</text>
					</view>
					<view class="list-head-text">
						<view>{{playList.name}}</view>
						<view>
							<image :src="playList.creator.avatarUrl" mode=""></image>{{playList.creator.nickname}}
						</view>
						<view>{{playList.description}}</view>
					</view>
				</view>
				<!-- #ifdef MP-WEIXIN -->
					<button class="list-share" open-type="share">
						<text class="iconfont icon-fenxiang"></text>分享给微信好友
					</button>
				<!-- #endif -->
				<view class="list-music">
					<view class="list-music-head">
						<text class="iconfont icon-bofang1"></text>
						<text>播放全部</text>
						<text>(共{{playList.trackCount}}首)</text>
					</view>
					<view class="list-music-item" v-for="(item,index) in playList.tracks" :key="index" @tap="handleToDetail(item.id)">
						<view class="list-music-top">{{index+1}}</view>
						<view class="list-music-song">
							<view>{{item.name}}</view>
							<view>
								<image v-if="priviLeges[index].flag > 60 && priviLeges[index].flag < 70" src="../../static/dujia.png" mode=""></image>
								<image v-if="priviLeges[index].maxbr == 999000" src="../../static/sq.png" mode=""></image>
								{{item.ar[0].name}} - {{item.name}}
							</view>
						</view>
						<view class="iconfont icon-bofang"></view>
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
				playList: {
					coverImgUrl: '',
					trackCount: '',
					creator: {
						avatarUrl: ''
					}
				},
				priviLeges: [],
				isLoading: true
			};
		},
		components: {
			musichead
		},
		onLoad(option) {
			uni.showLoading({
				title: '正在加载中。。。'
			})
			// console.log(option.id);
			this.getMusicList(option.id)
		},
		methods: {
			//获取歌单内容
			getMusicList(id) {
				request({url: '/playlist/detail',data:{id}}).then(res => {
					// console.log(res)
					if(res.data.code == '200') {
						this.playList = res.data.playlist;
						this.priviLeges = res.data.privileges;
						this.$store.commit('INIT_TOPLISTIDS',res.data.playlist.trackIds)
						this.isLoading = false;
						uni.hideLoading();
					}	
				})
			},
			handleToDetail(id) {
				uni.navigateTo({
					url: '../detail/detail?id=' + id
				})
			}
		}
	}
</script>

<style lang="less" scoped>
	.list-head {
		display: flex;
		margin: 30rpx;
		.list-head-img {
			width: 264rpx;
			height: 264rpx;
			border-radius: 30rpx;
			overflow: hidden;
			position: relative;
			margin-right: 42rpx;
			image {
				width: 100%;
				height: 100%;
			}
			text {
				position: absolute;
				right: 8rpx;
				top: 8rpx;
				color: white;
				font-size: 26rpx;
			}
		}
		.list-head-text {
			flex: 1;
			color: #f0f2f7;
			view:nth-child(1) {
				color: white;
				font-size: 34rpx;
			}
			view:nth-child(2) {
				display: flex;
				margin: 20rpx 0;
				font-size: 24rpx;
				align-items: center;
				image {
					width: 54rpx;
					height: 54rpx;
					border-radius: 50%;
					margin-right: 14rpx;
				}
			}
			view:nth-child(3) {
				line-height: 34rpx;
				font-size: 22rpx;
			}
		}
	}
	.list-share {
		width: 330rpx;
		height: 74rpx;
		margin: 0 auto;
		background: rgba(0,0,0,0.4);
		border-radius: 37rpx;
		color: white;
		text-align: center;
		line-height: 74rpx;
		font-size: 28rpx;
		text {
			margin-right: 16rpx;
		}
	}
	.list-music {
		background: white;
		border-radius: 50rpx;
		margin-top: 40rpx;
		overflow: hidden;
		.list-music-head {
			height: 50rpx;
			margin: 30rpx 0 70rpx 22rpx;
			text:nth-child(1) {
				height: 50rpx;
				font-size: 50rpx;
			}
			text:nth-child(2) {
				font-size: 30rpx;
				margin: 0 10rpx 0 26rpx;
			}
			text:nth-child(3) {
				font-size: 26rpx;
				color: #b2b2b2;
			}
		}
		.list-music-item {
			display: flex;
			margin: 0 32rpx 66rpx 46rpx;
			align-items: center;
			color: #959595;
			.list-music-top {
				width: 58rpx;
				font-size: 30rpx;
				line-height: 30rpx;
			}
			.list-music-song {
				flex: 1;
				view:nth-child(1) {
					font-size: 28rpx;
					color: black;
					width: 70vw;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
				view:nth-child(2) {
					font-size: 20rpx;
					align-items: center;
					width: 70vw;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					image {
						width: 32rpx;
						height: 20rpx;
						margin-right: 10rpx;
					}
				}
				view:nth-child(3) {}
			}
			text {
				font-size: 50rpx;
				color: #c7c7c7;
			}
		}
	}
</style>

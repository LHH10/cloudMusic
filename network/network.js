export const request = (params)=> {
	const baseURL = 'http://localhost:3000';
	return new Promise((resolve,reject) => {
		uni.request({
			...params,
			url: baseURL + params.url,
			method:params.methods||"GET",
			data:params.data || {},
			//请求成功后接收返回值，保存在resolve里面
			success: (result) => {
				resolve(result);
			},
			//请求失败捕捉异常
			fail: (err) => {
			uni.showToast({
				title:"接口请求失败"
			})
			reject(err)
			},
			complete: () => {
			}
		})
	})
}
import { shouldBeObject, getParameterError } from '../utils'

/**
 * 从本地相册选择图片或使用相机拍照。
 * @param {Object} object 参数
 * @param {string[]} [object.sourceType=['album', 'camera']] 选择图片的来源（h5端未实现）
 * @param {string[]} [object.sizeType=['original', 'compressed']] 所选的图片的尺寸（h5端未实现）
 * @param {number} [object.count=9] 最多可以选择的图片张数
 * @param {function} [object.success] 接口调用成功的回调函数
 * @param {function} [object.fail] 接口调用失败的回调函数
 * @param {function} [object.complete] 接口调用结束的回调函数（调用成功、失败都会执行）
 * @param {string} [object.imageId] 用来上传的input元素ID（仅h5端）
 */
const chooseImage = function (options) {
  // options must be an Object
  const isObject = shouldBeObject(options)
  if (!isObject.res) {
    const res = { errMsg: `chooseImage${isObject.msg}` }
    console.error(res.errMsg)
    return Promise.reject(res)
  }

  const { count = 1, success, fail, complete, imageId = 'taroChooseImage' } = options
  const res = {
    errMsg: 'chooseImage:ok',
    tempFilePaths: [],
    tempFiles: []
  }

  if (count && typeof count !== 'number') {
    res.errMsg = getParameterError({
      name: 'chooseImage',
      para: 'count',
      correct: 'Number',
      wrong: count
    })
    console.error(res.errMsg)
    typeof fail === 'function' && fail(res)
    typeof complete === 'function' && complete(res)
    return Promise.reject(res)
  }

  let taroChooseImageId = document.getElementById(imageId)
  if (!taroChooseImageId) {
    const obj = document.createElement('input')
    obj.setAttribute('type', 'file')
    obj.setAttribute('id', imageId)
    if (count > 1) {
      obj.setAttribute('multiple', 'multiple')
    }
    obj.setAttribute('accept', 'image/*')
    obj.setAttribute('style', 'position: fixed; top: -4000px; left: -3000px; z-index: -300;')
    document.body.appendChild(obj)
    taroChooseImageId = document.getElementById(imageId)
  } else {
    if (count > 1) {
      taroChooseImageId.setAttribute('multiple', 'multiple')
    } else {
      taroChooseImageId.removeAttribute('multiple')
    }
  }
  let taroChooseImageCallback
  const taroChooseImagePromise = new Promise(resolve => {
    taroChooseImageCallback = resolve
  })
  const TaroMouseEvents = document.createEvent('MouseEvents')
  TaroMouseEvents.initEvent('click', true, true)
  taroChooseImageId.dispatchEvent(TaroMouseEvents)
  taroChooseImageId.onchange = function (e) {
    const arr = [...e.target.files]
    arr && arr.forEach(item => {
      const blob = new Blob([item], {
        type: item.type
      })
      const url = URL.createObjectURL(blob)
      res.tempFilePaths.push(url)
      res.tempFiles.push({ path: url, size: item.size, type: item.type, originalFileObj: item })
    })
    typeof success === 'function' && success(res)
    typeof complete === 'function' && complete(res)
    taroChooseImageCallback(res)
    e.target.value = ''
  }
  return taroChooseImagePromise
}

export default chooseImage

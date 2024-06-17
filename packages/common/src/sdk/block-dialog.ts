/* eslint-disable unicorn/prefer-dom-node-remove */
/* eslint-disable unicorn/prefer-query-selector */
/* eslint-disable unicorn/prefer-dom-node-append */
const styleId = 'joyid-block-dialog-style'

const approveId = 'joyid-block-dialog-approve'

const rejectId = 'joyid-block-dialog-reject'

const styleSheet = `
.joyid-block-dialog {
  position: fixed;
  top: 32px;
  left: 50%;
  width: 340px;
  margin-left: -170px;
  background: white;
  color: #333;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  height: 110px;
  z-index: 100002;
  box-sizing: border-box;
  border: 1px solid #ffffff;
  border-radius: 8px;
  padding: 16px 20px;
}
.joyid-block-dialog-bg {
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  position: fixed;
  top: 0;
  left: 0;
  display: none;
  z-index: 100001;
  display: block;
}
.joyid-block-dialog-title {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 8px;
}
.joyid-block-dialog-tip {
  font-size: 12px;
  color: #777;
}
.joyid-block-dialog-btn {
  width: 90px;
  height: 35px;
  font-size: 12px;
  text-align: center;
  border-radius: 6px;
  cursor: pointer;
}
.joyid-block-dialog-action {
  text-align: right;
}
#${approveId} {
  border: 1px solid #333;
  color: #333;
  background: #D2FF00;
  margin-bottom: 8px;
}

#${rejectId} {
  background: transparent;
}
`

const dialogInnerHtml = `
<div class="joyid-block-dialog">
  <div class="joyid-block-dialog-content">
    <div class="joyid-block-dialog-title">
      Request Pop-up
    </div>
    <div class="joyid-block-dialog-tip">
      Click Approve to complete creating or using wallet
    </div>
  </div>
  <div class="joyid-block-dialog-action">
    <button class="joyid-block-dialog-btn" id="${approveId}">Approve</button>
    <button class="joyid-block-dialog-btn" id="${rejectId}">Reject</button>
  </div>
</div>
`

export const appendStyle = (): void => {
  const _style = document.getElementById(styleId)
  if (_style != null) {
    return
  }
  const style = document.createElement('style')
  style.appendChild(document.createTextNode(styleSheet))
  const head = document.head ?? document.getElementsByTagName('head')[0]
  head.appendChild(style)
}

export const createBlockDialog = async <T>(
  cb: (...args: any[]) => Promise<T>
): Promise<T> => {
  appendStyle()
  const dialog = document.createElement('div')
  dialog.innerHTML = dialogInnerHtml
  document.body.appendChild(dialog)
  const dialogBg = document.createElement('div')
  dialogBg.className = 'joyid-block-dialog-bg'
  document.body.appendChild(dialogBg)
  const approveBtn = document.getElementById(approveId)
  const rejectBtn = document.getElementById(rejectId)
  const closeDialog = (): void => {
    document.body.removeChild(dialog)
    document.body.removeChild(dialogBg)
  }
  return new Promise<T>((resolve, reject) => {
    approveBtn?.addEventListener('click', async () => {
      try {
        const data = await cb()
        closeDialog()
        resolve(data)
      } catch (error) {
        closeDialog()
        reject(error)
      }
    })
    rejectBtn?.addEventListener('click', () => {
      closeDialog()
      reject(new Error('User Rejected'))
    })
  })
}

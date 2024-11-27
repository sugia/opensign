import {
    Typography,
    Layout,
    Row,
    Col,
    Affix,
    Image,
    Button,
    Tooltip,
    Popover,
    Divider,
    Input,
    Space,
    Progress,
    Segmented,
    Modal,
    Upload,
    Empty,
    Spin,
} from 'antd'

import {
    DownloadOutlined,
    CloseOutlined,
    LeftOutlined,
    RightOutlined,
    EditOutlined,
    HomeOutlined,
    DeleteOutlined,
    UploadOutlined,
    BulbOutlined,
    AlertOutlined,
    FolderOpenOutlined,
    PlusOutlined,
    InboxOutlined,
} from '@ant-design/icons'

import {
    useContext,
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
} from 'react'

import { Context } from './store/Context'

import { useNavigate, useParams } from 'react-router-dom'
import DesktopHeader from './DesktopHeader'

import Draggable from 'react-draggable'

import {
    Rnd,
} from 'react-rnd'

function DraggableImage(props) {
    const [content, setContent] = useState(props.content || '')
    const [x, setX] = useState(props.x || 0)
    const [y, setY] = useState(props.y || 0)


    const [isFocused, setIsFocused] = useState(false)

    const [width, setWidth] = useState(props.width || 500)
    const [height, setHeight] = useState(props.height || 200)

    const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false)

    const updateXY = props.updateXY
    const updateWidthHeight = props.updateWidthHeight
    const deleteItem = props.deleteItem


    return (
        <Space.Compact
            style={{ 'display': 'flex', 'position': 'fixed' }}
            onMouseEnter={() => {
                setIsFocused(true)
            }}
            onMouseLeave={() => {
                setIsFocused(false)
            }}
        >
            <Rnd
                size={{ width: width, height: height }}
                position={{ x: x, y: y }}
                onDragStop={(e, data) => {
                    setX(data['lastX'])
                    setY(data['lastY'])
                    updateXY(data['lastX'], data['lastY'])
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                    setWidth(ref.style.width)
                    setHeight(ref.style.height)
                    updateWidthHeight(ref.style.width, ref.style.height)
                }}
                enableResizing={{
                    top: false,
                    right: false,
                    bottom: false,
                    left: false,
                    topRight: false,
                    bottomRight: true,
                    bottomLeft: true,
                    topLeft: true,
                }}
            >

                <Image preview={false} src={content}
                    style={{
                        'width': '100%',
                        'height': '100%',
                        'border': isFocused ? '2px dashed gray' : undefined,
                    }}
                />

                <Button
                    danger={isDeleteConfirmVisible ? true : false}
                    type={isDeleteConfirmVisible ? 'primary' : 'default'}
                    size='small'
                    icon={<CloseOutlined />}
                    onClick={() => {
                        if (isDeleteConfirmVisible) {
                            setIsDeleteConfirmVisible(false)
                            setIsFocused(false)

                            deleteItem()
                        } else {
                            setIsDeleteConfirmVisible(true)
                            setTimeout(() => {
                                setIsDeleteConfirmVisible(false)
                            }, 2000)
                        }
                    }}
                    style={{ 'visibility': isFocused ? 'visible' : 'hidden', 'position': 'absolute' }}
                />
            </Rnd>


        </Space.Compact>


    )
}

export default DraggableImage

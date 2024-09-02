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


function MobileDraggableText(props) {
    const [content, setContent] = useState(props.content || '')
    const [x, setX] = useState(props.x || 0)
    const [y, setY] = useState(props.y || 0)


    const contentWidth = useMemo(() => {
        return (content.length * 10) + 'px'
    }, [content])

    const [isFocused, setIsFocused] = useState(false)


    const inputRef = useRef(null)

    const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false)

    const updateContent = props.updateContent
    const updateXY = props.updateXY
    const deleteItem = props.deleteItem

    // to mute findDOMNode error
    // https://stackoverflow.com/questions/63603902/finddomnode-is-deprecated-in-strictmode-finddomnode-was-passed-an-instance-of-d
    const nodeRef = useRef(null)

    return (
        <Draggable
            nodeRef={nodeRef}
            position={{ x: x, y: y }}
            onStop={(e, data) => {
                setX(data['lastX'])
                setY(data['lastY'])
                updateXY(data['lastX'], data['lastY'])
            }}
        >
            <Row justify='start' ref={nodeRef}>
                <Space.Compact
                    onTouchStart={() => {
                        setIsFocused(true)
                        inputRef.current?.focus({
                            cursor: 'end',
                        })
                    }}
                    onBlur={() => {
                        setIsFocused(false)
                        inputRef.current?.blur()
                    }}
                    style={{ 'display': 'flex', 'position': 'fixed', 'zIndex': isFocused ? 2 : 1 }}
                >
                    <Input
                        ref={inputRef}
                        variant={isFocused ? 'outlined' : 'borderless'}
                        size='small'
                        placeholder='text box'
                        style={{
                            'width': contentWidth,
                            'minWidth': '100px',
                            'backgroundColor': isFocused ? 'white' : content === '' ? 'mistyRose' : 'rgba(0,0,0,0)',
                            'color': 'blue',
                        }}
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value)
                            updateContent(e.target.value)
                        }}
                        onPressEnter={() => {
                            setIsFocused(false)
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
                        style={{ 'visibility': isFocused ? 'visible' : 'hidden' }}
                    />
                </Space.Compact>
            </Row>
        </Draggable>
    )
}

export default MobileDraggableText

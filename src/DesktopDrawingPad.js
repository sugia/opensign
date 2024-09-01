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
    Drawer,
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


import html2canvas from 'html2canvas'

import jsPDF from 'jspdf'

import SignatureCanvas from 'react-signature-canvas'

import {
    Rnd,
} from 'react-rnd'

import * as PDFJS from 'pdfjs-dist/webpack'


function DesktopDrawingPad() {
    const {state, dispatch} = useContext(Context)

    const signatureRef = useRef()

    useEffect(() => {
        const tmp = localStorage.getItem('signature')
        signatureRef?.current?.fromDataURL(tmp, { width: state.signatureCanvasWidth, height: state.signatureCanvasHeight })
    }, [])

    return (
        <>
            <Row justify='space-between' align='middle'>
                <Col>
                    <Typography>
                        Signature
                    </Typography>
                </Col>
                <Col>
                    <Button type='text' onClick={() => {
                            signatureRef.current.clear()
                            localStorage.removeItem('signature')
                            
                            dispatch({
                                'value': {
                                    'signature': '',
                                }
                            })
                            
                        }}
                        icon={<DeleteOutlined />}
                    >
                    Clear Signature
                    </Button>
                </Col>
            </Row>
            <Row justify='center' 
                style={{'borderRadius': '16px', 'boxShadow': "5px 8px 24px 5px rgba(208, 216, 243, 0.4)",
                    'margin': '10px 0px'
                }}>
                <SignatureCanvas ref={signatureRef} penColor='blue' canvasProps={{
                    width: state.signatureCanvasWidth, height: state.signatureCanvasHeight}}     

                    onEnd={() => {
                        const tmp = signatureRef.current.getCanvas().toDataURL('image/png')

                        dispatch({
                            'value': {
                                'signature': tmp,
                            }
                        })
                        localStorage.setItem('signature', tmp)
                    }}
                />
            </Row>
            

            <Row justify='start' style={{'margin': '10px 0px'}}>

                <Input addonBefore={
                    <Row style={{'width': '100px'}}>
                        <Typography>Printed Name:</Typography>
                    </Row>
                }  value={state.printedName} placeholder='Open Sign' onChange={(e) => {
                        dispatch({
                            'value': {
                                'printedName': e.target.value,
                            }
                        })
                        localStorage.setItem('printedName', e.target.value)
                    }}
                    
                />

            </Row>
            
            <Row justify='start' style={{'margin': '10px 0px'}}>
                <Input addonBefore={
                    <Row style={{'width': '100px'}}>
                        <Typography>Name Initials:</Typography>
                    </Row>
                }  value={state.nameInitials} placeholder='OS' onChange={(e) => {
                        dispatch({
                            'value': {
                                'nameInitials': e.target.value,
                            }
                        })
                        localStorage.setItem('nameInitials', e.target.value)
                    }}
                    
                />
            </Row>
        </>
    )
}

export default DesktopDrawingPad

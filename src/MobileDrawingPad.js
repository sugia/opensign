import {
    Typography,
    Row,
    Col,
} from 'antd'

import {
    DeleteOutline,
} from 'antd-mobile-icons'

import {
    Space,
    Button,
    Tabs,
    Input,
    Form,
} from 'antd-mobile'

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

import SignatureCanvas from 'react-signature-canvas'


function MobileDrawingPad() {
    const { state, dispatch } = useContext(Context)
    const signatureRef = useRef()

    useEffect(() => {
        const tmp = localStorage.getItem('mobileSignature')
        signatureRef?.current?.fromDataURL(tmp, { width: state.mobileSignatureCanvasWidth, height: state.mobileSignatureCanvasHeight })
    }, [])

    return (
        <Tabs activeKey={state.mobileSegmentedValue} onChange={(key) => {
            
            dispatch({
                'value': {
                    'mobileSegmentedValue': key,
                }
            })

            // console.log(key)
        }}>
            <Tabs.Tab title='Text Box' key='Text Box'>

            </Tabs.Tab>

            <Tabs.Tab title='Signature' key='Signature'>
                <>
                    <Row justify='space-between' align='middle'>
                        <Col>
                            <p>
                                Signature
                            </p>
                        </Col>
                        <Col>
                            <Button type='text' onClick={() => {
                                signatureRef?.current?.clear()
                                localStorage.removeItem('mobileSignature')
                                dispatch({
                                    'value': {
                                        'mobileSignature': '',
                                    }
                                })
                            }}
                            >
                                <Space>
                                    <DeleteOutline />
                                    Delete
                                </Space>
                            </Button>
                        </Col>
                    </Row>

                    <Row justify='center'
                        style={{
                            'borderRadius': '16px', 'boxShadow': "5px 8px 24px 5px rgba(208, 216, 243, 0.4)",
                            'margin': '10px 0px'
                        }}>
                        <SignatureCanvas ref={signatureRef} penColor='blue' canvasProps={{
                            width: state.mobileSignatureCanvasWidth,
                            height: state.mobileSignatureCanvasHeight
                        }}

                            onEnd={() => {
                                const tmp = signatureRef.current.getCanvas().toDataURL('image/png')
                                dispatch({
                                    'value': {
                                        'mobileSignature': tmp,
                                    }
                                })
                                localStorage.setItem('mobileSignature', tmp)

                            }}
                        />
                    </Row>
                </>
            </Tabs.Tab>

            <Tabs.Tab title='Printed Name' key='Printed Name'>
                <Row justify='start' style={{ 'margin': '10px 0px' }}>
                    <Form layout='vertical' style={{'width': '100%'}}>
                        <Form.Item label='Printed Name' name='Printed Name'>
                            <Input value={state.mobilePrintedName} placeholder='Open Sign' onChange={(val) => {
                                dispatch({
                                    'value': {
                                        'mobilePrintedName': val,
                                    }
                                })
                                localStorage.setItem('mobilePrintedName', val)
                            }}
                            />
                        </Form.Item>
                    </Form>

                </Row>
            </Tabs.Tab>

            <Tabs.Tab title='Name Initials' key='Name Initials'>
                <Row justify='start' style={{ 'margin': '10px 0px' }}>
                    <Form layout='vertical' style={{'width': '100%'}}>
                        <Form.Item label='Name Initials' name='Name Initials'>
                            <Input value={state.mobileNameInitials} placeholder='OS' onChange={(val) => {
                                dispatch({
                                    'value': {
                                        'mobileNameInitials': val,
                                    }
                                })
                                localStorage.setItem('mobileNameInitials', val)
                            }}
                            />
                        </Form.Item>
                    </Form>
                </Row>
            </Tabs.Tab>
        </Tabs>
    )
}

export default MobileDrawingPad

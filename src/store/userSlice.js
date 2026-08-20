// userSlice.js
import { createSlice } from '@reduxjs/toolkit'
import { Cookies } from 'react-cookie'
const cookies = new Cookies();

const initialState = {
    num: '',
    id: '',
    pass: '',
    name: '',
    birth: '',
    phone: '',
    zip_num: '',
    add1: '',
    add2: '',
    add3: '',
    height: '',
    weight: '',
    profile_img: '',
    gender: '',
    provider: '',
    role_names: [],
    // accessToken: '',
    // refreshToken: '',
}

const getLoginUser = () => {
    const memberInfo = cookies.get('user')
    if (memberInfo && memberInfo.num) {
        memberInfo.num = decodeURIComponent(memberInfo.num)
        memberInfo.id = decodeURIComponent(memberInfo.id)
        memberInfo.pass = decodeURIComponent(memberInfo.pass)
        memberInfo.name = decodeURIComponent(memberInfo.name)
        memberInfo.birth = decodeURIComponent(memberInfo.birth)
        memberInfo.phone = decodeURIComponent(memberInfo.phone)
        memberInfo.zip_num = decodeURIComponent(memberInfo.zipNum)
        memberInfo.add1 = decodeURIComponent(memberInfo.add1)
        memberInfo.add2 = decodeURIComponent(memberInfo.add2)
        memberInfo.add3 = decodeURIComponent(memberInfo.add3)
        memberInfo.height = decodeURIComponent(memberInfo.height)
        memberInfo.weight = decodeURIComponent(memberInfo.weight)
        memberInfo.profile_img = decodeURIComponent(memberInfo.profile_img)
        memberInfo.gender = decodeURIComponent(memberInfo.gender)
        memberInfo.provider = decodeURIComponent(memberInfo.provider)
        memberInfo.role_names = decodeURIComponent(memberInfo.role_names)
        // memberInfo.accessToken = decodeURIComponent( memberInfo.accessToken )
        // memberInfo.refreshToken = decodeURIComponent( memberInfo.refreshToken )
    }
    return memberInfo
}

const userSlice = createSlice(
    {
        name: 'user',
        initialState: getLoginUser() || initialState,
        reducers: {
            loginAction: (state, action) => {
                state.num = action.payload.num
                state.id = action.payload.id
                state.pass = action.payload.pass
                state.name = action.payload.name
                state.birth = action.payload.birth
                state.phone = action.payload.phone
                state.zip_num = action.payload.zipNum
                state.add1 = action.payload.add1
                state.add2 = action.payload.add2
                state.add3 = action.payload.add3
                state.height = action.payload.height
                state.weight = action.payload.weight
                state.profile_img = action.payload.profile_img
                state.gender = action.payload.gender
                state.provider = action.payload.provider
                state.role_names = action.payload.role_names
                // state.accessToken = action.payload.accessToken
                // state.refreshToken = action.payload.refreshToken
            },
            logoutAction: (state) => {
                state.num = ''
                state.id = ''
                state.pass = ''
                state.name = ''
                state.birth = ''
                state.phone = ''
                state.zip_num = ''
                state.add1 = ''
                state.add2 = ''
                state.add3 = ''
                state.height = ''
                state.weight = ''
                state.profile_img = ''
                state.gender = ''
                state.provider = ''
                state.role_names = []
                // state.accessToken = ''
                // state.refreshToken = ''
            }
        }
    }
)
export const { loginAction, logoutAction, } = userSlice.actions
export default userSlice.reducer
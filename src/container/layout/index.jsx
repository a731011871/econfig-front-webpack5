import styled from 'styled-components';

const EConfigContainer = styled.div`
    height: 100%;
`;

const ProjectHeader = styled.div`
    height: 50px;
    background: #435C71;
    position: fixed;
    width: 100%;
    top: 10px;
    z-index: 999;
    white-space: nowrap;
    .e_config_header_left {
        .e_config_logo {
            font-size: 20px;
            color: #fff;
            line-height: 50px;
            padding: 0 20px;
            cursor: pointer;
        }
        ul {
            li {
                list-style: none;
                line-height: 50px;
                display: inline-block;
                padding: 0 25px 0 0;
                a {
                    font-size: 14px;
                    color: #fff;
                    text-decoration: none;
                    cursor: pointer;
                    position: relative;
                    display: inline-block;
                }
                .active::after {
                    content: "";
                    display: block;
                    width: 40%;
                    height: 2px;
                    background-color: #fc8864;
                    left: 30%;
                    bottom: 6px;
                    position: absolute;
                }
            }
        }
    }
`;

const EConfigHeader = styled.div`
    height: 50px;
    background: #435C71;
    display: flex;
    justify-content: space-between;
    /* position: fixed; */
    width: 100%;
    min-width: 900px;
    z-index: 10;
    top: 0;
    white-space: nowrap;
    .e_config_header_left {
        .e_config_logo {
            text-align: center;
            width: 125px;
            font-size: 23px;
            color: #fff;
            line-height: 50px;
            padding: 0 18px;
            cursor: pointer;
            transition: .5s ease;
            span {
                display: inline-block;
            }
            i {
                font-size: 14px;
            }
            .e_config_logo_animation {
                display: none;
            }
        }
        /* @keyframes que {
            0%{
                transform: rotate(0deg);
            }
            100%{
                transform: rotate(360deg);
            }
        }
        .e_config_logo:hover {
            transform: rotate(-8deg);
            i {
                animation: que 4s linear infinite;
            }
            .e_config_logo_text{ 
                display: none;
            }
            .e_config_logo_animation {
                display: inline;
            }
        } */
        ul {
            position: absolute;
            li {
                list-style: none;
                line-height: 50px;
                display: inline-block;
                padding: 0 18px 0 0;
                a {
                    font-size: 13px;
                    color: #fff;
                    text-decoration: none;
                    cursor: pointer;
                    position: relative;
                    display: inline-block;
                }
                .active::after {
                    content: "";
                    display: block;
                    width: 40%;
                    height: 2px;
                    background-color: #fc8864;
                    left: 30%;
                    bottom: 6px;
                    position: absolute;
                }
            }
        }
    }
    .e_config_header_right {
        ul {
            display: flex;
            li {
                list-style: none;
                line-height: 50px;
                padding: 0 15px 0 0px;
                a{
                    font-size: 12px;
                    color: #fff;
                    text-decoration: none;
                    font-weight: 100;
                    cursor: pointer;
                    position: relative;
                    display: inline-block;
                }
            }
            .tenant_name {
                white-space:nowrap; 
                overflow:hidden; 
                text-overflow:ellipsis;
                max-width: 200px;
            }
            .return {
                padding: 0;
                overflow: hidden;
                height:50px;
                width:50px;
                margin-left: 10px;
            }
        }
    }
    div, ul {
        display: inline-block;
    }
    @media screen and (max-width: 900px) {
        .e_config_header_right {
            ul {
                li:nth-of-type(1) {
                    a {
                        width: 30px;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                }
                li:nth-of-type(2) {
                    a {
                        width: 40px;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                }
            }
        }
        .e_config_header_left {
            .e_config_logo {
                font-size: 20px;
                color: #fff;
                line-height: 50px;
                padding: 0 15px;
            }
            ul {
                position: absolute;
                li {
                    list-style: none;
                    line-height: 50px;
                    display: inline-block;
                    padding: 0 12px 0 0;
                    a {
                        font-size: 13px;
                        color: #fff;
                        text-decoration: none;
                        cursor: pointer;
                        position: relative;
                        display: inline-block;
                    }
                    .active::after {
                        content: "";
                        display: block;
                        width: 40%;
                        height: 2px;
                        background-color: #fc8864;
                        left: 30%;
                        bottom: 6px;
                        position: absolute;
                    }
                }
            }
        }
    }
`;

const EConfigHeaderMenu = styled.div`
    clear: both;
    /* height: 40px; */
    background-color: #fff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    /* position: fixed; */
    z-index: 10;
    top: 50px;
    width: 100%;
    min-width: 900px;
    ul {
        margin-left: 110px;
        li {
            list-style: none;
            line-height: 40px;
            display: inline-block;
            padding: 0 25px 0 0;
            a{
                font-size: 13px;
                color: #000;
                text-decoration: none;
                cursor: pointer;
                position: relative;
                display: inline-block;
            }
            .active::after {
                content: "";
                display: block;
                width: 40%;
                height: 2px;
                background-color: #fc8864;
                left: 30%;
                bottom: 6px;
                position: absolute;
            }
        }
    }
`;

const EConfigSwitch = styled.div`
    margin: 10px;
    background: #fff;
    /* height: calc(100% - 105px); */
    /* height: 100%; */
    /* position: fixed; */
    /* margin-top: 100px; */
    padding-right: 10px;
    width: calc(100% - 20px);
    min-width: 900px;
    overflow: hidden;
    overflow-y: scroll;
`;

const SpinContainer = styled.div`
    background: #fff !important;
    height: 100%;
    width: 100%;
`;

const EmailPageContainer = styled.div`
    width: 100%;
    background: #fff;
    overflow: hidden;
    padding-bottom: 100px;
    .email-page-banner {
        height: 500px;
        min-width: 1200px;
        background-size: cover;
        background-repeat: no-repeat;
    }
    .email-page-content {
        width: 500px;
        margin-left: calc(50% - 250px);
        margin-top: 80px;
        padding-right: 12px;
        min-height: 300px;
        > span {
            text-align: center;
            display: block;
            font-size: 18px;
            font-weight: 800;
        }
        .email-page-content-con {
            padding-bottom: 20px;
            overflow: hidden;
            .email-page-content-title {
                float: left;
                font-size: 20px;
                color: #44b1ec;
                padding: 6px 20px;
                margin-left: 122px;
                border-bottom: 2px solid #44b1ec;
            }
            .email-page-content-tab {
                float: left;
                font-size: 20px;
                color: #44b1ec;
                padding: 6px 0;
                margin-left: 122px;
                a {
                    font-size: 20px;
                    padding: 12px 20px;
                    color: #333;
                    text-decoration: none;
                }
                .active {
                    color: #44b1ec;
                    border-bottom: 2px solid #44b1ec;
                }
            }
            .email-page-content-x {
                float: right;
                a {
                    color: #ccc;
                    font-size: 13px;
                    line-height: 44px;
                }
            }
        }
        .email-page-content-form {
            clear: both;
            .email-page-content-button {
                text-align: center;
                margin-top: 15px;
                .ant-btn-primary {
                    padding: 0 25px;
                }
            }
            .botton-verification {
                margin-left: 26px;
                width: 115px;
            }
            .input-verification {
                width: 250px;
            }
        }
    }
`;

export {
    EConfigContainer,
    EConfigHeader,
    ProjectHeader,
    EConfigHeaderMenu,
    EConfigSwitch,
    SpinContainer,
    EmailPageContainer
};
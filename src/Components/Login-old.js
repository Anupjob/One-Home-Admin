import React, {Component} from 'react';
import Axios from 'axios';
import swal from 'sweetalert';
import $ from 'jquery';
import Constant from "./Constant";

class Login extends Component {
    constructor(props) {
        super();
        this.state = {
            email: "",
            password: "",
            type: 1, // 1 for super admin, 2 partner admin, 3 for partner user
            login: false,
            errors: {}
        }
    }


    //--------------------------------------------change field value------------------------------------\\
    handleChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value
        })
    };

    //component did mount
    componentDidMount() {
        if (localStorage.getItem('loginDetails')) {
            // this.props.history("/dashboard");
        } else {
            // this.props.history("/");
        }
    }


    UNSAFE_componentDidMount() {
        if (localStorage.getItem('loginDetails')) {
            this.props.history("/dashboard");
        } else {
            this.props.history("/");
        }
    }


    handleSubmit = async (e) => {
        e.preventDefault();
        await Axios.post(Constant.apiBasePath + 'admin/signin', {
            email: this.state.email,
            password: this.state.password,
            type: this.state.type
        })
            .then(data => {
                data = data.data;
                if (data.meta.status) {
                    // console.log('loginDetails', data);
                    localStorage.setItem('loginDetails', data.token);
                    localStorage.setItem('userDetails', JSON.stringify(data.data));
                    window.location.href = '/dashboard';
                }else{
                    swal({text: data.meta.msg, icon: "warning", dangerMode: true});
                }
            })
            .catch(err => {
                if (err.response === undefined) {
                    swal({text: "API OFFLINE", icon: "warning", dangerMode: true});
                    return false;
                }
                let API_MESSAGE = err.response.data;
                if (err.response.status === 400) {
                    swal({text: API_MESSAGE.message, icon: "warning", dangerMode: true});
                } else {
                    swal({text: API_MESSAGE.message, icon: "warning", dangerMode: true});
                }
            })
    }


    render() {

        $(".fa-eye").on("mouseover", function () {
            $(this).toggleClassName(".fa-eye");
            var input = $("#password");
            input.attr("type", "text");
        })

        $(".fa-eye").on("mouseout", function () {
            $(this).toggleClass(".fa-eye");
            var input = $("#password");
            input.attr("type", "password");
        })

        return (
            <div
                className="auth-wrapper d-flex no-block justify-content-center align-items-center position-relative background-auth-modal">
                <div className="auth-box row mt-4">
                    <div className="col-lg-7 col-md-5 modal-bg-img auth-modal">
                    </div>
                    <div className="col-lg-5 col-md-7 bg-white">
                        <div className="p-3">
                            <div className="text-center">
                                {/* <img src={images} alt="wrapkit" /> */}
                                <h1>One Home</h1>
                            </div>
                            <h2 className="mt-3 text-center">Sign In</h2>
                            {/*<p className="text-center">Enter your email address and password to access admin panel.</p>*/}
                            <form className="mt-4" onSubmit={this.handleSubmit}>
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label className="text-dark" htmlFor="uname">Type</label>

                                            <select id="type" className="form-control" value={this.state.type}
                                                    onChange={this.handleChange}>
                                                <option value="1">Super Admin</option>
                                                <option value="2">Partner</option>
                                                <option value="3">Partner User</option>
                                            </select>

                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label className="text-dark" htmlFor="uname">Email</label>
                                            <input className="form-control" id="email" type="email"
                                                   placeholder="enter your username" onChange={this.handleChange}
                                                   value={this.state.name}/>
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="form-group">
                                            <label className="text-dark" htmlFor="pwd">Password</label>
                                            <input className="form-control" id="password" type="password"
                                                   placeholder="enter your password" onChange={this.handleChange}
                                                   value={this.state.password}/>
                                        </div>
                                    </div>
                                    <div className="col-lg-12 text-center">
                                        <button type="submit" className="btn btn-block btn-dark">Sign In</button>
                                    </div>
                                    {/* <div className="col-lg-12 text-center mt-5">
                                Don't have an account? <a href="#" className="text-danger">Sign Up</a>
                            </div> */}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}

export default Login;
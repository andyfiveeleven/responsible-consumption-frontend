import React from 'react'
import superagent from 'superagent'
import {isEmail, isAlphanumeric, isAscii} from 'validator'
import debounce from 'lodash/fp/debounce'

import './_login.scss';
import Tooltip from '../../tooltip/index'
import * as util from '../../../lib/util'
import {connect} from 'react-redux';
import {Redirect} from 'react-router';

import {signupRequest} from '../../../actions/login-actions.js';


class LoginForm extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      email: '',
      username: '',
      password: '',
      emailError: null,
      usernameError: null,
      usernameAvailable: true,
      passwordError: null,
      focused: null,
      error: false,
      submitted: false,
    }

    this.validateInput = this.validateInput.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleBlur = this.handleBlur.bind(this)
    this.handleFocus = this.handleFocus.bind(this)
  }

  validateInput(e){
    let {name, value} = e.target

    let errors = {
      emailError: this.state.emailError,
      passwordError: this.state.passwordError,
      usernameError: this.state.usernameError,
    }

    let setError = (name, error) => {
      let errorName = `${name}Error`
      errors[errorName] = error
    }
    let deleteError = (name) => {
      let errorName = `${name}Error`
      errors[errorName] = null
    }

    if(name === 'email')
      if(!value)
        setError(name, `${name} can not be empty`)
      else if(!isEmail(value))
        setError(name, `${value} is not a valid email`)
      else
        deleteError(name)

    if(name === 'username'){
      if(!value)
        setError(name, `${name} can not be empty`)
      else if(!isAlphanumeric(value))
        setError(name, `username may only contain letters and numbers`)
      else if(value.length < 8)
        setError(name, `username must be 8 characters`)
      else deleteError(name)
    }

    if(name === 'password'){
      if(!value)
        setError(name, `${name} can not be empty`)
      else if(!isAscii(value))
        setError(name, `password may only contain normal characters`)
      else if(value.length < 8)
        setError(name, `password must be 8 characters`)
      else deleteError(name)
    }

    this.setState({
      ...errors,
      error: !!(errors.emailError || errors.usernameError || errors.passwordError),
    })
  }

  handleFocus(e){
    this.setState({ focused: e.target.name })
  }

  handleBlur(e){
    let {name} = e.target
    this.setState(state => ({
      focused: state.focused == name ? null : state.focused,
    }))
  }

  handleChange(e){
    let {name, value} = e.target
    this.validateInput({...e})

    this.setState({
      [name]: value,
    })
  }



  handleSubmit(e){
    e.preventDefault()
    if(!this.state.error){
      this.props.onComplete(this.state)
      .then(() => {
        this.setState({username: '', email: '', password: ''})
      })
      .catch(error => {
        console.error(error)
        this.setState({
          error,
          submitted: true,
        })
      })
    }
    this.setState(state => ({
      submitted: true,
      usernameError: state.usernameError || state.username ? null : 'required',
      emailError: state.emailError || state.email ? null : 'required',
      passwordError: state.passwordError || state.password ? null : 'required',
    }))
  }

  render(){
    let {
      focused,
      submitted,
      username,
      emailError,
      passwordError,
      usernameError,
      usernameAvailable
    } = this.state


    return (
      <form
        onSubmit={this.handleSubmit}
        className={util.classToggler({
          'auth-form': true,
          'error': this.state.error && this.state.submitted,
        })}>
        <div>

          <input
            className='login'
            type='text'
            name='username'
            placeholder='username'
            value={this.state.username}
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            />
        </div>

        <div>

          <input
            className='login'
            type='password'
            name='password'
            placeholder='password'
            value={this.state.password}
            onChange={this.handleChange}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            />
        </div>



          <button type='submit'>
            {this.props.buttonText}
          </button>

      </form>
    )
  }
}

export default LoginForm

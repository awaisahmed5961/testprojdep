class LoginScreen extends React.Component {
  render() {
    return (
		<div id="login" class="center">
			<h1> Login </h1>
			UserID* <br/> <input id="user" type="text" required><br/>
			Password* <br/> <input id="password"  type="password" required><br/>
			<br/>
			<button onclick="login()">login</button>
			<br/>
			<br/>
			<span id="login_failed" style="color:red"></span>
		</div>
    );
  }
  
  export default LoginScreen;
}
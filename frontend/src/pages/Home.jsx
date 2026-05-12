import { Link } from "react-router-dom"

function Home(){
    return (
        <section id="center">
            <Link to="/signup">
            <button className="button signupButton">
                Sign up
            </button>
            </Link>
            <div class="signincontainer">
                <span>Already have an account?</span>
                <Link to="/signin">
                <button className="button signinButton">
                    Sign in
                </button>
                </Link>
            </div>
        </section>
    )
}

export default Home
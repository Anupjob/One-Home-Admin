import React ,{Component} from 'react';
import { Link } from 'react-router-dom';


class NotFoundPage extends Component{
    render(){
        return (
                 <div>
                 <Link to="/">
            <img src="images/pageNotFound.jpg"  />
            </Link>
            </div>
        );
    }
}
export default NotFoundPage;
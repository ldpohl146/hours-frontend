import React from 'react';
import { Card, Image, Dimmer, Loader } from 'semantic-ui-react';

const LoadingCardView = (props) => 
    <Card centered>
        <Dimmer active={props.loading}>
            <Loader content="loading" />
        </Dimmer>
        <Image src={props.image} />
        <Card.Content>
            <Card.Header>{props.header}</Card.Header>
            <Card.Meta>{props.meta}</Card.Meta>
        </Card.Content>
        {props.extra 
        ? <Card.Content extra>{props.extra}</Card.Content> 
        : null    
        }
        
    </Card>

export default LoadingCardView
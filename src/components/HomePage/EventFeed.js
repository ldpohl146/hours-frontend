import React, { Component, Fragment } from "react";
import { Feed, Segment, Dimmer, Loader, Image, Grid } from "semantic-ui-react";
import { Link } from "react-router-dom";

import { timeSince } from "../../helpers";
import { db } from "../../firebase";

import jennySmall from "../../jennySmall.jpg";
import elliotSmall from "../../elliotSmall.jpg";
import helenSmall from "../../helenSmall.jpg";
import joeSmall from "../../joeSmall.jpg";
import "./EventFeed.css";

const imageArray = [jennySmall, elliotSmall, helenSmall, joeSmall];

const FeedFromArray = props => (
  <Feed id="eventFeed">
    {props.feedItems.map(feedItem => (
      <Feed.Event key={feedItem.id}>
        <Feed.Label className="middle aligned">
          <Image
            src={imageArray[Math.floor(Math.random() * imageArray.length)]}
            verticalAlign="middle"
          />
        </Feed.Label>
        <Feed.Content>
          <Segment className="feed item" raised>
            <Feed.Summary>
              {feedItem.summary}
              <Feed.Date>{feedItem.date} ago</Feed.Date>
            </Feed.Summary>
            <Feed.Extra text>{feedItem.extra}</Feed.Extra>
          </Segment>
        </Feed.Content>
      </Feed.Event>
    ))}
  </Feed>
);

const eventLogMapper = {
  SEND_TOKENS: eventItem => {
    const { docId: id, details, dateCreated } = eventItem;
    const hours = details.amount;
    const description = details.description || "";
    const toLink = <Link to={`user/${details.to.id}`}>{details.to.name}</Link>;
    const fromLink = (
      <Link to={`user/${details.from.id}`}>{details.from.name}</Link>
    );
    return {
      id,
      summary: (
        <Fragment>
          {toLink} recieved {hours} hours from {fromLink}
        </Fragment>
      ),
      date: timeSince(dateCreated),
      extra: description
    };
  },
  APPROVE_TOKENS: eventItem => {
    const { docId: id, details, dateCreated } = eventItem;
    const hours = details.tokens;
    const description = details.description;
    const contributorLink = (
      <Link to={`user/${details.requesterId}`}>{details.requesterName}</Link>
    );
    const organisationLink = (
      <Link to={`organisation/${details.fromId}`}>{details.fromName}</Link>
    );
    return {
      id,
      summary: (
        <Fragment>
          {contributorLink} contributed {hours} hours to {organisationLink}{" "}
          (Approved)
        </Fragment>
      ),
      date: timeSince(dateCreated),
      extra: description
    };
  },
  REQUEST_TOKENS: eventItem => {
    const { docId: id, details, dateCreated } = eventItem;
    const hours = details.loggedHours;
    const description = details.description;
    const contributorLink = (
      <Link to={`user/${details.requester.id}`}>{details.requester.name}</Link>
    );
    const organisationLink = (
      <Link to={`organisation/${details.fromOrg.id}`}>
        {details.fromOrg.name}
      </Link>
    );
    return {
      id,
      summary: (
        <Fragment>
          {contributorLink} helped {hours} people with {organisationLink}{" "}
          (Pending approval)
        </Fragment>
      ),
      date: timeSince(dateCreated),
      extra: description
    };
  }
};

class EventFeed extends Component {
  state = {
    feedItems: [],
    loading: true
  };

  componentDidMount() {
    let feedItems = [];
    db.getEventLog()
      // .then(events => events.filter(event => event.type === 'REQUEST_TOKENS'))
      // .then(console.info)
      .then(events =>
        events.filter(
          event =>
            event.type === "APPROVE_TOKENS" ||
            event.type === "SEND_TOKENS" ||
            event.type === "REQUEST_TOKENS"
        )
      )
      .then(events => {
        feedItems = events.map(event => eventLogMapper[event.type](event));
        this.setState({ feedItems });
      })
      .catch(console.error)
      .then(() => this.setState({ loading: false }));
  }

  render() {
    const feedItems = this.state.feedItems;
    return (
      <Grid centered container columns={2} stackable id="eventFeedContainer">
        <Grid.Column>
          <Dimmer active={this.state.loading}>
            <Loader content="loading" />
          </Dimmer>
          <FeedFromArray feedItems={feedItems} />
        </Grid.Column>
      </Grid>
    );
  }
}

export default EventFeed;

import React from 'react';

import { Grid, Button, Segment, Label, Icon, Divider } from 'semantic-ui-react'

import PropTypes from 'prop-types';
import isNil from 'lodash/isNil';
import Token from './Token';
import map from 'lodash/map';
import filter from 'lodash/filter';
import findIndex from 'lodash/findIndex';
import UuidSupport from '../../../SupportTools/UuidSupport';
import FhirConstant from '../../../Constants/FhirConstant';
//import { isNullOrUndefined } from 'util';

export default class TokenSearch extends React.Component {

    static propTypes = {
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        onAddOrRemoveButtonClick: PropTypes.func,
        onTokenEdit: PropTypes.func,
        isEditMode: PropTypes.bool,
        type: PropTypes.string,
        modifier: PropTypes.string,
        tokenElementList: PropTypes.array,
        searchTypeColor: PropTypes.string
    }

    static defaultProps = {
        type: FhirConstant.searchType.token,
        tokenElementList: null,
        searchTypeColor: 'teal',
        modifier: 'none'
    }

    constructor(props) {
        super(props);

        let Tokenlist = this.props.tokenElementList;
        if (isNil(this.props.tokenElementList)) {
            const NewGuid = UuidSupport.createGUID();
            Tokenlist = [{ id: NewGuid, code: '', system: '' }];
        }

        this.state = {
            tokenElementList: Tokenlist,
            modifier: this.props.modifier
        };

    }

    onOrButtonClick = (e) => {
        if (e.eventIsAdd) {

            const tokenParameter = {
                id: UuidSupport.createGUID(),
                system: '',
                code: ''
            };

            const newArray = this.state.tokenElementList.slice(0);
            newArray.push(tokenParameter);

            this.setState({
                tokenElementList: newArray,
            })

        } else {
            const newArray = filter(this.state.tokenElementList, function (currentObject) {
                return currentObject.id != e.eventId;
            });

            //Tell the higer order component to rerender because we have removed an element, needed to  update the FHIR Query
            if (this.props.isEditMode) {
                this.props.onTokenEdit({
                    eventId: this.props.id,
                    eventType: this.props.type,
                    eventName: this.props.name,
                    modifier: this.state.modifier,
                    eventValueList: newArray
                })
            }

            this.setState({ tokenElementList: newArray })
        }
    }

    onAddClick = () => {

        this.props.onAddOrRemoveButtonClick({
            eventId: this.props.id,
            eventName: this.props.name,
            eventType: this.props.type,
            eventModifier: this.state.modifier,
            eventValueList: this.state.tokenElementList
        })
    }

    onRemoveClick = (e) => {
        e.preventDefault();

        this.props.onAddOrRemoveButtonClick({
            eventId: this.props.id,
        })
    }


    onTokenEdit = (e) => {

        const tokenParameter = {
            id: e.submittedId,
            system: e.submittedSystem,
            code: e.submittedCode,
        };

        let newArray = this.state.tokenElementList.slice(0);
        const Index = findIndex(newArray, { id: tokenParameter.id })
        newArray.splice(Index, 1, tokenParameter);

        //if the modifier is of type 'missing' then there can be no Values
        if (e.submittedModifier == 'missing') {
            newArray = [{ id: UuidSupport.createGUID(), system: '', code: '' }]
        }

        if (this.props.isEditMode) {
            this.props.onTokenEdit({
                eventId: this.props.id,
                eventType: this.props.type,
                eventName: this.props.name,
                eventModifier: e.submittedModifier,
                eventValueList: newArray
            })
        }


        this.setState({ tokenElementList: newArray, modifier: e.submittedModifier })
    }



    render() {

        const renderLabelName = () => {
            return <Label color={this.props.searchTypeColor} attached='top left'>Parameter: {this.props.name}</Label>
        };

        const renderLabelType = () => {
            return <Label color={this.props.searchTypeColor} attached='top right'>Type: {this.props.type}</Label>
        };

        const renderButton = () => {
            if (this.props.isEditMode) {
                return <Button onClick={this.onRemoveClick} floated='right' size='big' icon color='red'><Icon name='remove circle' /></Button>
            } else {
                return <Button onClick={this.onAddClick} floated='right' size='big' icon color='green'><Icon name='add' /></Button>
            }
        };

        const renderToken = () => {
            return (
                <Grid>
                    {map(this.state.tokenElementList, (item, Index) => {
                        if (this.state.tokenElementList.length == 1) {
                            return (
                                <Grid.Row key={item.id} columns={1}>
                                    <Grid.Column width={16} >
                                        <Token isFirstToken={true} addOrButton={true} onOrAddRemoveClick={this.onOrButtonClick} id={item.id} modifier={this.state.modifier} code={item.code} system={item.system} onTokenEdit={this.onTokenEdit} />
                                    </Grid.Column>
                                </Grid.Row>
                            )
                        } else if (Index == this.state.tokenElementList.length - 1) {
                            return (
                                <React.Fragment key={item.id}>

                                    <Grid.Row verticalAlign='middle'>
                                        <Grid.Column width={16} >
                                            <Divider fitted horizontal>OR</Divider>
                                        </Grid.Column>
                                    </Grid.Row>

                                    <Grid.Row columns={1}>
                                        <Grid.Column width={16} >
                                            <Token isFirstString={false} addOrButton={true} onOrAddRemoveClick={this.onOrButtonClick} id={item.id} modifier={this.state.modifier} code={item.code} system={item.system} onTokenEdit={this.onTokenEdit} />
                                        </Grid.Column>
                                    </Grid.Row>

                                </React.Fragment>
                            )
                        } else if (Index == 0) {
                            return (
                                <React.Fragment key={item.id}>
                                    <Grid.Row columns={1}>
                                        <Grid.Column width={16} >
                                            <Token isFirstToken={true} addOrButton={false} onOrAddRemoveClick={this.onOrButtonClick} id={item.id} modifier={this.state.modifier} code={item.code} system={item.system} onTokenEdit={this.onTokenEdit} />
                                        </Grid.Column>
                                    </Grid.Row>
                                </React.Fragment>
                            )
                        } else {
                            return (
                                <React.Fragment key={item.id}>

                                    <Grid.Row verticalAlign='middle'>
                                        <Grid.Column width={16} >
                                            <Divider fitted horizontal>OR</Divider>
                                        </Grid.Column>
                                    </Grid.Row>

                                    <Grid.Row columns={1}>
                                        <Grid.Column width={16} >
                                            <Token isFirstString={false} addOrButton={false} onOrAddRemoveClick={this.onOrButtonClick} id={item.id} modifier={this.state.modifier} code={item.code} system={item.system} onTokenEdit={this.onTokenEdit} />
                                        </Grid.Column>
                                    </Grid.Row>
                                </React.Fragment>
                            )
                        }
                    })}
                </Grid>
            )
        };


        return (
            <Segment color={this.props.searchTypeColor}>
                {renderLabelName()}
                {renderLabelType()}
                <Grid>
                    <Grid.Row columns={16}>
                        <Grid.Column width={15} >
                            <Divider horizontal hidden></Divider>
                            <Segment>

                                {renderToken()}
                            </Segment>
                        </Grid.Column>
                        <Grid.Column width={1} verticalAlign='top' >
                            <Divider horizontal hidden></Divider>
                            {renderButton()}
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        )


    }


}

import React from 'react';

import { Grid, Form } from 'semantic-ui-react'

import PropTypes from 'prop-types';
import UuidSupport from '../../../SupportTools/UuidSupport';
import SearchOrButton from './SearchOrButton';
import FhirConstant from '../../../Constants/FhirConstant';

export default class Number extends React.Component {

    static propTypes = {
        onEdit: PropTypes.func.isRequired,
        onOrAddRemoveClick: PropTypes.func,
        id: PropTypes.string,
        prefix: PropTypes.string,
        number: PropTypes.string,
        modifier: PropTypes.string,
        isLast: PropTypes.bool,
        isFirst: PropTypes.bool
    }

    static defaultProps = {
        id: UuidSupport.createGUID(),
        prefix: '',
        number: '',
        modifier: 'none',
        isLast: false,
        isFirst: false
    }

    constructor(props) {
        super(props);

        this.state = {
            prefix: this.props.prefix,
            number: this.props.number,
            modifier: this.props.modifier
        };
    }

    getSubmitted = () => {
        return (
            {
                submittedId: this.props.id,
                submittedType: FhirConstant.searchType.number,
                submittedPrefix: this.state.prefix,
                submittedNumber: this.state.number,
                submittedModifier: this.state.modifier,
            }
        )
    }

    onEdit = (e) => {
        e.preventDefault();

        const target = e.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });

        let NumberEvent = this.state.number;
        if (name == 'number') {
            NumberEvent = value;
        }

        const submitted = this.getSubmitted();
        submitted.submittedNumber = NumberEvent;
        this.props.onEdit(submitted);
    }

    onModifierChange = (e, { value }) => {
        e.preventDefault();

        const submitted = this.getSubmitted();
        submitted.submittedModifier = value;
        this.props.onEdit(submitted);

        if (value == 'missing') {
            this.setState({
                modifier: value,
                prefix: '',
                number: ''
            });
        } else {
            this.setState({
                modifier: value
            });
        }
    }

    onPrefixChange = (e, { value }) => {
        e.preventDefault();

        const submitted = this.getSubmitted();
        submitted.submittedPrefix = value;
        this.props.onEdit(submitted);

        this.setState({
            prefix: value
        });
    }

    onOrAdd = () => {     
        this.props.onOrAddRemoveClick({
            eventId: this.props.id,
            eventIsAdd: true
        })
    }

    onOrRemove = () => {
        this.props.onOrAddRemoveClick({
            eventId: this.props.id,
            eventIsAdd: false
        })
    }

    render() {

        const renderSearchOrButton = () => {
            if (this.props.isLast) {
                return (
                    <SearchOrButton
                        isDisable={false}
                        id={this.state.id}
                        onOrAdd={this.onOrAdd}
                        onOrRemove={this.onOrRemove}
                    />
                )
            } else {
                return (
                    <SearchOrButton
                        isDisable={false}
                        id={this.state.id}
                        //onOrAdd={this.onOrAdd}
                        onOrRemove={this.onOrRemove}
                    />
                )
            }
        }


        const modifierOptions = () => {
            return (
                [
                    { key: 'none', text: 'None', value: 'none' },
                    { key: 'missing', text: 'Missing', value: 'missing' },
                ]
            )
        }

        const prefixOptions = () => {
            return (
                [
                    { key: 'none', text: 'None', value: 'none' },
                    { key: 'ne', text: '!=', value: 'ne' },
                    { key: 'eq', text: '=', value: 'eq' },
                    { key: 'gt', text: '>', value: 'gt' },
                    { key: 'ge', text: '>=', value: 'ge' },
                    { key: 'lt', text: '<', value: 'lt' },
                    { key: 'le', text: '<=', value: 'le' },
                ]
            )
        }

        const disableDueToMissing = () => {
            if (this.state.modifier == 'missing') {
                return true;
            } else {
                return false;
            }
        }

        const renderModifierSelector = () => {
            if (this.props.isFirst) {
                return (
                    <Grid.Row columns={3}>
                        <Grid.Column width={3} >
                            <Form>
                                <Form.Group widths='equal'>
                                    <Form.Select width={3} compact label='Modifier' value={this.state.modifier} options={modifierOptions()} placeholder='Modifier' onChange={this.onModifierChange} />
                                </Form.Group>
                            </Form>
                        </Grid.Column>
                    </Grid.Row>
                )
            } else {
                return null;
            }
        }

        const { prefix, number } = this.state
        return (
            <Grid>
                {renderModifierSelector()}
                <Grid.Row columns={3}>
                    <Grid.Column width={14} >
                        <Form>
                            <Form.Group widths='equal'>
                                <Form.Select width={2} compact
                                    label='Prefix'
                                    value={prefix}
                                    options={prefixOptions()}
                                    placeholder='Prefix'
                                    onChange={this.onPrefixChange}
                                    disabled={disableDueToMissing()}
                                />
                                <Form.Field label='Number' width={10} name='number' control='input' disabled={disableDueToMissing()} placeholder='100.5' value={number} onChange={this.onEdit} />
                            </Form.Group>
                        </Form>
                    </Grid.Column>
                    <Grid.Column width={1} floated='left' verticalAlign='middle' >
                        {renderSearchOrButton()}
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        )
    }

}

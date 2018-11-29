import React from 'react';

import { Grid, Button, Form, Label, Divider, Header, Popup, Segment, List, Image, Icon } from 'semantic-ui-react'

import map from 'lodash/map';
import filter from 'lodash/filter';
import findIndex from 'lodash/findIndex';
import reverse from 'lodash/reverse';
import isNil from 'lodash/isNil';
import endsWith from 'lodash/endsWith';
import noop from 'lodash/noop';

import PropTypes from 'prop-types';

import FhirQueryButton from '../FhirComponent/Search/FhirQueryButton';
import EncodingButton from '../FhirComponent/Search/EncodingButton';
import SummaryButton from '../FhirComponent/Search/SummaryButton';
import SearchTypeFrame from '../FhirComponent/Search/SearchTypeFrame';
import ResponseRender from '../FhirComponent/Search/ResponseRender';
import PublicServerResetMessage from '../../Componets/PublicServer/Messages/PublicServerResetMessage';
import DeviceConstants from '../../Constants/DeviceConstants';

import UuidSupport from '../../SupportTools/UuidSupport'
import FhirConstant from '../../Constants/FhirConstant';
import FhirServerConstant from '../../Constants/FhirServerConstant';


export default class PyroServerSearchComponent extends React.Component {

    static propTypes = {
        ConformanceStatmentResource: PropTypes.object.isRequired,
        FhirServerName: PropTypes.string.isRequired,
        FhirIcon: PropTypes.string,
    }

    static defaultProps = {
        FhirIcon: require('../../Images/FhirIcon/icon-fhir-32.png')
    }

    constructor(props) {
        super(props);

        this.state = {
            selectedResource: [{ key: 'none', icon: 'tag', text: 'none', value: 'none' }],
            selectedSearch: 'none',
            SearchElement: null,
            // SearchElement: { key: 'none', icon: 'search', text: 'none', description: 'none', value: 'none' },
            savedSearchParameters: [],
            encodingType: FhirConstant.DefaultFhirJsonFormat,
            summaryType: FhirConstant.searchSummaryType.none,
        };
    }

    onResourceFilterChange = (e, { value }) => {
        e.preventDefault();
        const ResourceArray = filter(this.props.ConformanceStatmentResource.rest[0].resource, { 'type': value });
        this.setState(() => ({ selectedResource: value, ResourceElement: ResourceArray[0] }));
    }

    onSearchFilterChange = (e, { value }) => {
        e.preventDefault();
        const SearchArray = filter(this.state.ResourceElement.searchParam, { 'name': value });
        this.setState(() => ({ selectedSearch: value, SearchElement: SearchArray[0] }));
    }

    onAddSearchParameter = (e) => {
        // e.preventDefault();

        const searchParameter = {
            id: e.eventId,
            type: e.eventType,
            name: e.eventName,
            showEdit: false,
            modifier: e.eventModifier,
            valueList: e.eventValueList
        };
        const newArray = this.state.savedSearchParameters.slice(0);
        newArray.push(searchParameter);

        this.setState({ savedSearchParameters: newArray, SearchElement: null, selectedSearch: 'none' })
    };

    onEncodeingClick = (e) => {
        this.setState({ encodingType: e.encodingType })
    }

    onSummaryClick = (e) => {
        this.setState({ summaryType: e.summaryType })
    }

    onCancelClick = () => {
        this.setState({ SearchElement: null, selectedSearch: 'none' })
    }

    onRemoveSearchParameter = (e) => {
        // e.preventDefault();

        const newArray = filter(this.state.savedSearchParameters, function (currentObject) {
            return currentObject.id != e.eventId;
        });

        this.setState({ savedSearchParameters: newArray })
    };

    onEditSearchParameter = (e) => {

        const searchParameter = {
            id: e.eventId,
            type: e.eventType,
            name: e.eventName,
            modifier: e.eventModifier,
            showEdit: true,
            valueList: e.eventValueList,
        };

        const newArray = this.state.savedSearchParameters.slice(0);
        const Index = findIndex(newArray, { id: searchParameter.id })
        newArray.splice(Index, 1, searchParameter);

        this.setState({ savedSearchParameters: newArray })
    };

    onSendClick = () => {
        noop();
        //const xx = this.generateSendQuery();
    };

    onShowEdit = (e) => {

        const newArray = this.state.savedSearchParameters.slice(0);
        const Index = findIndex(newArray, { id: e.eventId })
        //toggel bolean
        newArray[Index].showEdit = !newArray[Index].showEdit;

        this.setState({ savedSearchParameters: newArray })

    };

    onHideEdit = (e) => {

        const newArray = this.state.savedSearchParameters.slice(0);
        const Index = findIndex(newArray, { id: e.eventId })
        newArray[Index].showEdit = false;

        this.setState({ savedSearchParameters: newArray })

    };


    generateSendQuery = () => {
        let counter = 0;
        const ServerEndpoint = FhirServerConstant.getEndpointForServerName(this.props.FhirServerName);
        const ResourceName = this.state.selectedResource;
        let MainQuery = `${ServerEndpoint}/${ResourceName}`;
        const TempArray = this.queryElementArray();
        for (let i = 0; i < TempArray.length; i++) {
            let queryDelimiter = '&';
            if (counter == 0) {
                queryDelimiter = '?';
            }
            //Below checks is the query is empty and does not render it if it is as it means nothing
            if (!endsWith(TempArray[i].queryString, '=', TempArray[i].queryString.length)) {
                counter++;
                MainQuery = MainQuery.concat(`${queryDelimiter}${TempArray[i].queryString}`)
            }
        }
        return MainQuery;
    }

    queryElementArray = () => map(this.state.savedSearchParameters, (item) => {
        if (item.type == FhirConstant.searchType.token) {
            let theQuery = `${item.name}=`;
            for (let i = 0; i < item.valueList.length; i++) {
                if (i > 0) {
                    if (item.valueList[i].system == '') {
                        theQuery = theQuery.concat(`,${item.valueList[i].code}`)
                    } else {
                        theQuery = theQuery.concat(`,${item.valueList[i].system}|${item.valueList[i].code}`)
                    }
                } else {
                    if (item.modifier != 'none') {
                        theQuery = `${item.name}:${item.modifier}=true`;
                    } else if (item.valueList[i].system == '') {
                        theQuery = theQuery.concat(`${item.valueList[i].code}`)
                    } else {
                        theQuery = theQuery.concat(`${item.valueList[i].system}|${item.valueList[i].code}`)
                    }
                }
            }
            return { id: item.id, queryString: theQuery, searchType: item.type }

        } else if (item.type == FhirConstant.searchType.string) {

            let theQuery = `${item.name}=`;
            for (let i = 0; i < item.valueList.length; i++) {

                if (i > 0) {
                    if (!isNil(item.valueList[i]) && !isNil(item.valueList[i].string) && item.valueList[i].string != '') {
                        theQuery = theQuery.concat(`,${item.valueList[i].string}`)
                    }
                } else {
                    if (item.modifier != 'none') {
                        if (item.modifier == 'missing') {
                            theQuery = `${item.name}:${item.modifier}=true`;
                        } else {
                            if (!isNil(item.valueList[i]) && !isNil(item.valueList[i].string) && item.valueList[i].string != '') {
                                theQuery = `${item.name}:${item.modifier}=${item.valueList[i].string}`;
                            }
                        }
                    } else {
                        if (!isNil(item.valueList[i]) && !isNil(item.valueList[i].string) && item.valueList[i].string != '') {
                            theQuery = theQuery.concat(`${item.valueList[i].string}`)
                        }
                    }
                }
            }
            return { id: item.id, queryString: theQuery, searchType: item.type }

        } else if (item.type == FhirConstant.searchType.quantity) {

            let theQuery = `${item.name}=`;
            for (let i = 0; i < item.valueList.length; i++) {

                if (i > 0) {
                    if (!isNil(item.valueList[i]) && !isNil(item.valueList[i].number) && item.valueList[i].number != '') {
                        theQuery = theQuery.concat(`,${item.valueList[i].prefix}${item.valueList[i].number}|${item.valueList[i].system}|${item.valueList[i].code}`)
                    }
                } else {
                    if (item.modifier != 'none') {
                        if (item.modifier == 'missing') {
                            theQuery = `${item.name}:${item.modifier}=true`;
                        } else {
                            if (!isNil(item.valueList[i]) && !isNil(item.valueList[i].number) && item.valueList[i].number != '') {
                                theQuery = `${item.name}:${item.modifier}=${item.valueList[i].prefix}${item.valueList[i].number}|${item.valueList[i].system}|${item.valueList[i].code}`;
                            }
                        }
                    } else {
                        if (!isNil(item.valueList[i]) && !isNil(item.valueList[i].number) && item.valueList[i].number != '') {
                            theQuery = theQuery.concat(`${item.valueList[i].prefix}${item.valueList[i].number}|${item.valueList[i].system}|${item.valueList[i].code}`)
                        }
                    }
                }
            }
            return { id: item.id, queryString: theQuery, searchType: item.type }

        } else if (item.type == FhirConstant.searchType.date) {

            let theQuery = `${item.name}=`;

            for (let i = 0; i < item.valueList.length; i++) {

                if (i > 0) {
                    if (!isNil(item.valueList[i]) && !isNil(item.valueList[i].dateTimeString) && item.valueList[i].dateTimeString != '') {
                        theQuery = theQuery.concat(`,${item.valueList[i].prefix}${item.valueList[i].dateTimeString}`)
                    }
                } else {
                    if (item.modifier != 'none') {
                        if (item.modifier == 'missing') {
                            theQuery = `${item.name}:${item.modifier}=true`;
                        } else {
                            if (!isNil(item.valueList[i]) && !isNil(item.valueList[i].dateTimeString) && item.valueList[i].dateTimeString != '') {
                                theQuery = `${item.name}:${item.modifier}=${item.valueList[i].dateTimeString}`;
                            }
                        }
                    } else {
                        if (!isNil(item.valueList[i]) && !isNil(item.valueList[i].dateTimeString) && item.valueList[i].dateTimeString != '') {
                            theQuery = theQuery.concat(`${item.valueList[i].prefix}${item.valueList[i].dateTimeString}`)
                        }
                    }
                }
            }
            return { id: item.id, queryString: theQuery, searchType: item.type }

        } else {
            return 'notdone!!';
        }
    })


    render() {

        const FhirResource = this.props.ConformanceStatmentResource;

        const ResourceList = map(FhirResource.rest[0].resource, function (item) {
            return { key: item.type, icon: 'tag', text: item.type, value: item.type };
        });

        const searchList = () => {
            if (isNil(this.state.ResourceElement)) {
                return [{ key: 'none', icon: 'search', text: 'none', description: 'none', value: 'none' }]
            } else {
                return (map(this.state.ResourceElement.searchParam, function (item) {
                    return { key: item.name, icon: 'search', text: item.name, description: item.documentation, value: item.name };
                }))
            }
        };

        const renderFhirQuery = () => {
            const ButtonSize = 'small';
            return (
                <Grid>
                    <Grid.Row columns={16} only='computer'>
                        <Grid.Column width={16}>
                            <Header size='tiny'>FHIR Query</Header>
                            <Segment>
                                <Grid doubling>
                                    <Grid.Row columns={16}>
                                        <Grid.Column width={13}>
                                            {renderFhirUrl(ButtonSize)}
                                        </Grid.Column>
                                        <Grid.Column width={3} >
                                            <Button.Group size={ButtonSize} >
                                                <Popup trigger={<Button color='black'><Icon name='trash' /></Button>} content='Clear the query' />
                                                <Popup trigger={<Button color='black'><Icon name='clipboard'></Icon></Button>} content='Copy to clipboard' />
                                                <Button color='blue' onClick={this.onSendClick}>Send</Button>
                                            </Button.Group>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Segment>
                        </Grid.Column>
                    </Grid.Row >
                    <Grid.Row columns={16} only='tablet'>
                        <Grid.Column width={16}>
                            <Header size='tiny'>FHIR Query</Header>
                            <Segment>
                                <Grid doubling>
                                    <Grid.Row columns={16}>
                                        <Grid.Column width={11}>
                                            {renderFhirUrl(ButtonSize)}
                                        </Grid.Column>
                                        <Grid.Column width={5} >
                                            <Button.Group size={ButtonSize} >
                                                <Popup trigger={<Button color='black'><Icon name='trash' /></Button>} content='Clear the query' />
                                                <Popup trigger={<Button color='black'><Icon name='clipboard'></Icon></Button>} content='Copy to clipboard' />
                                                <Button color='blue' onClick={this.onSendClick}>Send</Button>
                                            </Button.Group>
                                        </Grid.Column>
                                    </Grid.Row>
                                </Grid>
                            </Segment>
                        </Grid.Column>
                    </Grid.Row >
                </Grid>
            )
        }

        const renderServerInfo = () => {
            return (
                <Grid>
                    <Grid.Row columns={16} only='computer'>
                        <Grid.Column width={16}>
                            <Segment>
                                <List verticalAlign='middle' relaxed size='medium'>
                                    <List.Item>
                                        <Image avatar src={this.props.FhirIcon} />
                                        <List.Content>
                                            <List.Header>[Base] FHIR R4 Endpoint</List.Header>
                                            <List.Description>
                                                <code>{FhirServerConstant.PyroR4FhirServerEndpoint}</code>
                                            </List.Description>
                                        </List.Content>
                                    </List.Item>
                                </List>
                            </Segment>
                        </Grid.Column>
                    </Grid.Row >
                </Grid>
            )
        }


        const renderResourceSelector = () => {

            let ResourcePopupMessage = 'Select a resource to search on';
            if (this.state.savedSearchParameters.length > 0) {
                ResourcePopupMessage = 'You must clear all search parameters to modify the currect resource type';
            }

            let LockResourceSelector = false;
            if (this.state.savedSearchParameters.length > 0) {
                LockResourceSelector = true;
            }
            return (
                <Segment raised >
                    <PublicServerResetMessage deviceType={DeviceConstants.deviceType.computer} plural={false} />
                    {renderFhirQuery()}
                    {renderServerInfo()}
                    <Segment>
                        <Grid>
                            <Grid.Row columns={16}>
                                <Grid.Column width={4}>
                                    <EncodingButton size='tiny' onClick={this.onEncodeingClick} />
                                </Grid.Column>
                                <Grid.Column width={5}>
                                    <SummaryButton size='tiny' onClick={this.onSummaryClick} />
                                </Grid.Column>
                            </Grid.Row>

                        </Grid>
                    </Segment>
                    <Divider horizontal hidden></Divider>
                    <Form>
                        <Popup trigger={
                            <Form.Group widths='equal'>
                                <Form.Select
                                    disabled={LockResourceSelector}
                                    label='Resource'
                                    fluid
                                    defaultValue='none'
                                    options={ResourceList}
                                    placeholder='Resource'
                                    search
                                    closeOnChange
                                    onChange={this.onResourceFilterChange} />
                            </Form.Group>
                        } content={ResourcePopupMessage} />
                    </Form>
                    {renderSearch()}
                    {renderSearchType()}
                </Segment>
            )
        }

        const renderSearch = () => {
            if (isNil(this.state.ResourceElement)) {
                return null;
            } else {
                return (
                    <Form>
                        <Form.Group widths='equal'>
                            <Form.Select
                                label='Search Parameter'
                                fluid
                                options={searchList()}
                                placeholder='Search Parameter'
                                search
                                closeOnChange
                                onChange={this.onSearchFilterChange}
                                value={this.state.selectedSearch} />
                        </Form.Group>
                    </Form>                    
                )
            }
        }

        const renderSearchType = () => {
            //Non-EditMode Search Parameter Render            
            if (isNil(this.state.SearchElement)) {
                return null;
            } else {
                return (
                    <SearchTypeFrame
                        type={this.state.SearchElement.type}
                        onAddOrRemoveButtonClick={this.onAddSearchParameter}
                        onCancelClick={this.onCancelClick}
                        name={this.state.SearchElement.name}
                        isEditMode={false}
                        id={UuidSupport.createGUID()}
                    />
                )
            }
        }

        const renderSavedSearchPatrameterList = () => {

            const ShowEditCount = filter(this.state.savedSearchParameters, { 'showEdit': true }).length;

            const renderAndDivider = (CurrectCounter) => {
                if (ShowEditCount > 1 && CurrectCounter > 1) {
                    return <Divider horizontal>And</Divider>
                }
            }

            const revList = this.state.savedSearchParameters.slice(0);
            reverse(revList);
            let CurrectCounter = 0;
            return (
                <Grid.Row columns={16}>
                    <Grid.Column width={16}>
                        {map(revList, (item) => {
                            if (!item.showEdit) {
                                return null;
                            }
                            CurrectCounter++
                            return (
                                <React.Fragment key={item.id}>
                                    {renderAndDivider(CurrectCounter)}
                                    <SearchTypeFrame
                                        type={item.type}
                                        onAddOrRemoveButtonClick={this.onRemoveSearchParameter}
                                        onCheckClick={this.onHideEdit}
                                        onEdit={this.onEditSearchParameter}
                                        id={item.id}
                                        name={item.name}
                                        modifier={item.modifier}
                                        isEditMode={true}
                                        elementList={item.valueList}
                                    />
                                </React.Fragment>
                            )
                        })}
                    </Grid.Column>
                </Grid.Row>
            )
        }

        const renderQueryLabels = (ButtonSize) => {
            let counter = 0;
            const TempArray = this.queryElementArray();
            return (

                map(TempArray, (item, index) => {
                    let queryDelimiter = '&';
                    if (counter == 0) {
                        queryDelimiter = '?';
                    }
                    //Below checks is the query is empty and does not render it if it is as it means nothing
                    if (!endsWith(item.queryString, '=', item.queryString.length)) {
                        counter++;
                        if (item.searchType == FhirConstant.searchType.token) {
                            return (
                                <FhirQueryButton
                                    key={index}
                                    id={item.id}
                                    size={ButtonSize}
                                    delimiter={queryDelimiter}
                                    value={item.queryString}
                                    color='teal'
                                    onClick={this.onShowEdit}
                                    onRemoveClick={this.onRemoveSearchParameter} />
                            )
                        } else if (item.searchType == FhirConstant.searchType.string) {
                            return (
                                <FhirQueryButton
                                    key={index}
                                    id={item.id}
                                    size={ButtonSize}
                                    delimiter={queryDelimiter}
                                    value={item.queryString}
                                    color='blue'
                                    onClick={this.onShowEdit}
                                    onRemoveClick={this.onRemoveSearchParameter} />
                            )
                        } else if (item.searchType == FhirConstant.searchType.quantity) {
                            return (
                                <FhirQueryButton
                                    key={index}
                                    id={item.id}
                                    size={ButtonSize}
                                    delimiter={queryDelimiter}
                                    value={item.queryString}
                                    color='violet'
                                    onClick={this.onShowEdit}
                                    onRemoveClick={this.onRemoveSearchParameter} />
                            )
                        } else if (item.searchType == FhirConstant.searchType.date) {
                            return (
                                <FhirQueryButton
                                    key={index}
                                    id={item.id}
                                    size={ButtonSize}
                                    delimiter={queryDelimiter}
                                    value={item.queryString}
                                    color='purple'
                                    onClick={this.onShowEdit}
                                    onRemoveClick={this.onRemoveSearchParameter} />
                            )
                        } else {
                            return null;
                        }
                    }
                })
            )
        }

        const renderFhirUrl = (ButtonSize) => {
            if (!isNil(this.state.ResourceElement)) {
                return (
                    <Label.Group >
                        <Button basic compact size={ButtonSize} color='black'>[Base]</Button>
                        <Button basic compact size={ButtonSize} color='grey'>/</Button>
                        <Button basic compact size={ButtonSize} color='green'>{this.state.selectedResource}</Button>
                        {renderQueryLabels(ButtonSize)}
                    </Label.Group>

                )
            } else {
                return (
                    <Label.Group >
                        <Button basic compact size={ButtonSize} color='black'>[Base]</Button>
                        <Button basic compact size={ButtonSize} color='grey'>/</Button>
                    </Label.Group>
                )
            }
        };

        const renderQueryResponse = () => {

            return (
                <Grid.Row columns={16}>
                    <Grid.Column width={16}>
                        <ResponseRender />
                    </Grid.Column>
                </Grid.Row>
            )
        }

        return (

            <Grid>
                <Grid.Row columns={16}>
                    <Grid.Column width={16}>
                        {renderResourceSelector()}
                    </Grid.Column>
                </Grid.Row>
                {renderSavedSearchPatrameterList()}
                {renderQueryResponse()}
            </Grid>

        )
    }


}

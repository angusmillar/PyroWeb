import React from 'react';
import PropTypes from 'prop-types';
import isNil from 'lodash/isNil';
import { Table } from 'semantic-ui-react'

import Expandable_Table from '../Reusable/Table/Expandable_Table';
import RestVerbHeaderComponent from './RestVerbHeaderComponent';
import RestHttpStatusComponent from './RestHttpStatusComponent'
import FhirResourceExampleGenerator from './FhirResourceExampleGenerator'
import ResponseComponent from './ResponseComponent'
import RequestComponent from './RequestComponent'
import RestHttpHeadersComponent from './RestHttpHeadersComponent'
import RestBodyComponent from './RestBodyComponent'

import FhirConstant from '../../Constants/FhirConstant';
import HttpConstant from '../../Constants/HttpConstant';
import FormatSupport from '../../SupportTools/FormatSupport';
import UuidSupport from '../../SupportTools/UuidSupport'

export default class RestGetVReadComponent extends React.Component {

    static propTypes = {
        resourceName: PropTypes.string.isRequired,
        endpointUrl: PropTypes.string.isRequired,
        contentTypeElement: PropTypes.element.isRequired,
        acceptElement: PropTypes.element.isRequired,
        acceptResponseElement: PropTypes.element.isRequired,        
    }

    static defaultProps = {
    }

    constructor(props) {
        super(props);
    }

    render() {

        const VerbGetName = 'GET';
        const VerbGetColor = 'blue';
        const VerbPath = `${this.props.resourceName}/[id]/_history`
        const GUID = UuidSupport.createGUID();

        // ================= Request Setup ===========================================================

        const getRequestExampleURL = () => {
            return (
                <code>
                    <p>{`[Endpoint URL]/${this.props.resourceName}/${GUID}/_history`}</p>
                </code>
            )
        }

        const getRequestHttpHeadersComponent = () => {
            if (!isNil(FhirConstant.GetRequestHeaders) && FhirConstant.GetRequestHeaders.length != 0) {
                return (
                    <RestHttpHeadersComponent
                        httpHeaders={FhirConstant.GetRequestHeaders}
                        contentTypeElement={this.props.contentTypeElement}
                        acceptElement={this.props.acceptElement}
                        color={'violet'} />
                )
            } else {
                return null;
            }
        };

        // ================= Response Setup ===========================================================

        const getBodyOkExampleResource = (FormatType) => {
            if (FormatType === FormatSupport.FormatType.JSON) {
                return FhirResourceExampleGenerator.getJsonHistoryBundleResource(this.props.resourceName, GUID);
            } else if (FormatType === FormatSupport.FormatType.XML) {
                return FhirResourceExampleGenerator.getXmlHistoryBundleResource(this.props.resourceName, GUID);
            } else {
                return `SyntaxLanguage was ${FormatType.toString()}, can not create example resource`;
            }
        }

        const getBodyBadRequestExampleResource = (FormatType) => {
            if (FormatType === FormatSupport.FormatType.JSON) {
                return FhirResourceExampleGenerator.getJsonOperationOutcome();
            } else if (FormatType === FormatSupport.FormatType.XML) {
                return FhirResourceExampleGenerator.getXmlOperationOutcome();
            } else {
                return `SyntaxLanguage was ${FormatType.toString()}, can not create example ${FhirConstant.OperationOutcomeResourceNam} resource`;
            }
        }

        const getResponseBodyOkComponent = (Color) => {
            const FormatRequired = FormatSupport.resolveFormatFromString(this.props.acceptResponseElement.props.value)
            return (
                <RestBodyComponent
                    userMessage={<div>
                        <p>{`A history ${FhirConstant.BundleResourceName} resource which contained all history instances of the ${this.props.resourceName} resource with the resource id requested.`}</p>
                        <p>{`In this example we see the history of an ${this.props.resourceName} resource with the resource id of `}<code>{GUID}</code> {` where the resource was first
                        created with a POST, then updated with a PUT and then deleted with a DELETE.`}</p>
                        </div>
                        }
                    resourceName={this.props.resourceName}
                    isBundleResource={true}
                    formatType={FormatRequired}
                    resourceData={getBodyOkExampleResource(FormatRequired)}
                    color={Color}
                />
            )

        }

        const getResponseBodyBadRequestComponent = (Color) => {
            const FormatRequired = FormatSupport.resolveFormatFromString(this.props.acceptResponseElement.props.value)
            return (
                <RestBodyComponent
                    userMessage={<p>{`An ${FhirConstant.OperationOutcomeResourceName} resource containing information about the error that has occured.`}</p>}
                    resourceName={FhirConstant.OperationOutcomeResourceName}
                    isBundleResource={false}
                    formatType={FormatRequired}
                    resourceData={getBodyBadRequestExampleResource(FormatRequired)}
                    color={Color}
                />
            )
        }


        const getResponseOkHeadersComponent = (Color) => {
            return (
                <RestHttpHeadersComponent
                    httpHeaders={FhirConstant.getResponseSearchHeaders()}
                    contentTypeElement={this.props.acceptResponseElement}
                    acceptElement={null}
                    color={Color}
                />
            )
        }

        const getResponseBadRequestHeadersComponent = (Color) => {
            return (
                <RestHttpHeadersComponent
                    httpHeaders={FhirConstant.responseOperationOutcomeHeaders()}
                    contentTypeElement={this.props.acceptResponseElement}
                    acceptElement={null}
                    color={Color}
                />
            )
        }

        const getStatusOKComponent = () => {
            const HttpStatus = HttpConstant.getStatusCodeByNumber('200');
            return (
                <RestHttpStatusComponent
                    userMessage={<div>
                        <p>The request was successful and a history {FhirConstant.BundleResourceName} resource is returned containing {this.props.resourceName} resources matching you requested id.</p>
                    </div>}
                    statusNumber={HttpStatus.number}
                    statusText={HttpStatus.description}
                    statusColor={HttpStatus.color}
                    headerComponent={getResponseOkHeadersComponent(HttpStatus.color)}
                    bodyComponent={getResponseBodyOkComponent(HttpStatus.color)}
                />
            )

        }

        const getStatusBadRequestComponent = () => {
            const HttpStatus = HttpConstant.getStatusCodeByNumber('400');
            return (
                <RestHttpStatusComponent
                    userMessage={<div>
                        <p>Some form of error has occured with the request. An {FhirConstant.OperationOutcomeResourceName} resource will be return indicating what went wrong.</p>
                    </div>}
                    statusNumber={HttpStatus.number}
                    statusText={HttpStatus.description}
                    statusColor={HttpStatus.color}
                    headerComponent={getResponseBadRequestHeadersComponent(HttpStatus.color)}
                    bodyComponent={getResponseBodyBadRequestComponent(HttpStatus.color)}
                />
            )

        }

        const getStatusComponentArray = () => {
            const OK = getStatusOKComponent();
            const Bad = getStatusBadRequestComponent()

            return { OK, Bad }
        }



        // ================= Render Table Body Setup ===========================================================


        const renderGetSearchTableBody = (Expand) => {
            if (Expand) {
                const StatusComponentArray = getStatusComponentArray();
                const description = `Returns a history ${FhirConstant.BundleResourceName} resource containing all historic instance of the ${this.props.resourceName} resource with the resource id requested`;
                return (
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell colSpan='16'>{description}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell colSpan='16'>
                                <RequestComponent
                                    exampleComponet={getRequestExampleURL()}
                                    headersComponent={getRequestHttpHeadersComponent()}
                                    bodyComponent={null}
                                />
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell colSpan='16'>
                                <ResponseComponent
                                    statusComponentArray={StatusComponentArray}
                                />
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                )
            } else {
                return null;
            }
        };

        const renderTableHeader = (Verb, Color, Path) => {
            return (
                <RestVerbHeaderComponent
                    verb={Verb}
                    color={Color}
                    path={Path}
                />
            )
        };

        return (
            <Expandable_Table
                tableHeadingComponent={renderTableHeader(VerbGetName, VerbGetColor, VerbPath)}
                tableHeadingTitle={VerbGetName}
                tableColorType={VerbGetColor}
                tableColorInverted={false}
                tableRowsFunction={renderGetSearchTableBody}
            />
        )
    }

}

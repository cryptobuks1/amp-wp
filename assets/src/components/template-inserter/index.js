/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Dropdown, IconButton, Button } from '@wordpress/components';
import { Component } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';
import { createBlock, cloneBlock } from '@wordpress/blocks';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { BlockPreview } from '../';
import pageIcon from '../../../images/add-page-inserter.svg';
import addTemplateIcon from '../../../images/add-template.svg';
import './edit.css';

const storyPageBlockName = 'amp/amp-story-page';

class TemplateInserter extends Component {
	constructor() {
		super( ...arguments );

		this.onToggle = this.onToggle.bind( this );

		this.state = {
			reusableBlocks: [],
		};
	}

	componentDidMount() {
		this.props.fetchReusableBlocks();
	}

	componentDidUpdate( prevProps ) {
		// This check is needed to make sure that the blocks are loaded in time.
		if ( prevProps.reusableBlocks !== this.props.reusableBlocks || prevProps.allBlocks !== this.props.allBlocks ) {
			this.setState( {
				reusableBlocks: this.props.reusableBlocks,
			} );
		}
	}

	onToggle( isOpen ) {
		const { onToggle } = this.props;

		// Surface toggle callback to parent component
		if ( onToggle ) {
			onToggle( isOpen );
		}
	}

	render() {
		const { insertBlock, getBlock } = this.props;
		return (
			<Dropdown
				className="editor-inserter block-editor-inserter"
				contentClassName="amp-stories__template-inserter__popover is-from-top is-bottom editor-inserter__popover"
				onToggle={ this.onToggle }
				expandOnMobile
				renderToggle={ ( { onToggle, isOpen } ) => (
					<IconButton
						icon={ addTemplateIcon( { width: 16, height: 16 } ) }
						label={ __( 'Insert Template', 'amp' ) }
						onClick={ onToggle }
						className="editor-inserter__amp-inserter"
						aria-haspopup="true"
						aria-expanded={ isOpen }
					/>
				) }
				renderContent={ ( { onClose } ) => {
					const isStoryBlock = ( clientId ) => {
						const block = getBlock( clientId );
						return block && storyPageBlockName === block.name;
					};

					const onSelect = ( item ) => {
						const block = ! item ? createBlock( storyPageBlockName ) : getBlock( item.clientId );
						onClose();
						// Clone block to avoid duplicate ID-s.
						insertBlock( cloneBlock( block ) );
					};

					const storyTemplates = this.state.reusableBlocks.filter( ( { clientId } ) => isStoryBlock( clientId ) );

					return (
						<div key="template-list" className="amp-stories__editor-inserter__menu">
							<div
								className="amp-stories__editor-inserter__results"
								tabIndex="0"
								role="region"
								aria-label={ __( 'Available templates', 'amp' ) }
							>
								<div role="list" className="editor-block-types-list block-editor-block-types-list">
									<div className="editor-block-preview block-editor-block-preview">
										<IconButton
											icon={ pageIcon( { width: 86, height: 96 } ) }
											label={ __( 'Blank Page', 'amp' ) }
											onClick={ () => {
												onSelect( null );
											} }
											className="amp-stories__blank-page-inserter editor-block-preview__content block-editor-block-preview__content editor-styles-wrapper"
										/>
									</div>
									{ storyTemplates && storyTemplates.map( ( item ) => (
										<Button
											key={ `template-preview-${ item.id }` }
											onClick={ () => {
												onSelect( item );
											} }
											className="components-button block-editor-block-preview"
										>
											<BlockPreview
												name="core/block"
												attributes={ { ref: item.id } }
											/>
										</Button>
									) ) }
								</div>
							</div>
						</div>
					);
				} }
			/>
		);
	}
}

export default compose(
	withSelect( ( select ) => {
		const {
			__experimentalGetReusableBlocks: getReusableBlocks,
		} = select( 'core/editor' );

		const {
			getBlock,
			getBlocks,
		} = select( 'core/block-editor' );

		return {
			reusableBlocks: getReusableBlocks(),
			getBlock,
			allBlocks: getBlocks(),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const {
			__experimentalFetchReusableBlocks: fetchReusableBlocks,
		} = dispatch( 'core/editor' );

		const { insertBlock } = dispatch( 'core/block-editor' );

		return {
			fetchReusableBlocks,
			insertBlock,
		};
	} )
)( TemplateInserter );

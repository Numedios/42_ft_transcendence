import styled from "styled-components"
import { Link } from 'react-router-dom'

import colors from "../../utils/colors"

export const Style = styled.div`

	width: 240px;
	height: 53px;
	min-width: 240px;
	min-height: 53px;

	background-color: #FDE14F;

`

export const StyledLink = styled(Link)`

	color: ${colors.text};

	text-decoration: none;
	
`
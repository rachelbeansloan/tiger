<?php

namespace Tiger\TigerBundle\Controller\Imaginet;


use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;


// these import the "@Route" and "@Template" annotations
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;


class IndexController extends Controller
{
	/**
     * @Route("/")
     * @Template()
     */
    public function indexAction()
    {
    	date_default_timezone_set('UTC'); 
    	$today = time();
        $data = array(
        	'today' => $today
        	);

        return $data;
    }

    /**
     * @Route("/")
     * @Template()
     */
    public function infoAction()
    {
    	$data = array(
    		'results' => $_POST
    	);

        return $data;
    }

}